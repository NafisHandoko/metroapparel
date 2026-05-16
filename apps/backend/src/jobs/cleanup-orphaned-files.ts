import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import * as fs from "fs"
import * as path from "path"
import {
  METRO_SITE_GALLERY_METADATA_KEY,
  METRO_SITE_HERO_METADATA_KEY,
  parseGalleryUrlsFromStoreMetadata,
  parseHeroUrlsFromStoreMetadata,
} from "../metro/metro-site-content"

const STATIC_DIR = path.join(process.cwd(), "static")
const DRY_RUN = process.env.CLEANUP_DRY_RUN !== "false"

export default async function cleanupOrphanedFiles(
  container: MedusaContainer,
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info(
    `[cleanup-orphaned-files] Starting cleanup (DRY_RUN=${DRY_RUN})...`,
  )

  try {
    // 1. Collect all referenced URLs from database
    const referencedUrls = new Set<string>()

    // Get product images
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "thumbnail", "images.*"],
    })

    for (const product of products) {
      if (product.thumbnail) {
        referencedUrls.add(product.thumbnail)
      }
      if (product.images && Array.isArray(product.images)) {
        for (const img of product.images) {
          if (img.url) {
            referencedUrls.add(img.url)
          }
        }
      }
    }

    // Get store metadata (gallery & hero images)
    const { data: stores } = await query.graph({
      entity: "store",
      fields: ["id", "metadata"],
    })

    for (const store of stores) {
      if (store.metadata) {
        const galleryUrls = parseGalleryUrlsFromStoreMetadata(
          store.metadata[METRO_SITE_GALLERY_METADATA_KEY],
        )
        if (galleryUrls) {
          for (const url of galleryUrls) {
            referencedUrls.add(url)
          }
        }

        const heroUrls = parseHeroUrlsFromStoreMetadata(
          store.metadata[METRO_SITE_HERO_METADATA_KEY],
        )
        if (heroUrls) {
          for (const url of heroUrls) {
            referencedUrls.add(url)
          }
        }
      }
    }

    logger.info(
      `[cleanup-orphaned-files] Found ${referencedUrls.size} referenced URLs in database`,
    )

    // 2. Extract filenames from URLs (only local static files)
    const referencedFilenames = new Set<string>()
    for (const url of referencedUrls) {
      // Only process local static URLs
      if (url.includes("/static/")) {
        const filename = url.split("/static/").pop()
        if (filename) {
          referencedFilenames.add(decodeURIComponent(filename))
        }
      }
    }

    logger.info(
      `[cleanup-orphaned-files] ${referencedFilenames.size} local static files are in use`,
    )

    // 3. List files in static directory
    if (!fs.existsSync(STATIC_DIR)) {
      logger.info(`[cleanup-orphaned-files] Static directory does not exist, skipping`)
      return
    }

    const filesInStatic = fs.readdirSync(STATIC_DIR).filter((f) => {
      const fullPath = path.join(STATIC_DIR, f)
      return fs.statSync(fullPath).isFile()
    })

    logger.info(
      `[cleanup-orphaned-files] Found ${filesInStatic.length} files in static directory`,
    )

    // 4. Find orphaned files
    const orphanedFiles: string[] = []
    for (const file of filesInStatic) {
      if (!referencedFilenames.has(file)) {
        orphanedFiles.push(file)
      }
    }

    if (orphanedFiles.length === 0) {
      logger.info(`[cleanup-orphaned-files] No orphaned files found`)
      return
    }

    logger.info(
      `[cleanup-orphaned-files] Found ${orphanedFiles.length} orphaned files`,
    )

    // 5. Delete orphaned files (or log in dry run mode)
    let deletedCount = 0
    let totalSizeBytes = 0

    for (const file of orphanedFiles) {
      const filePath = path.join(STATIC_DIR, file)
      const stats = fs.statSync(filePath)
      totalSizeBytes += stats.size

      if (DRY_RUN) {
        logger.info(
          `[cleanup-orphaned-files] [DRY RUN] Would delete: ${file} (${formatBytes(stats.size)})`,
        )
      } else {
        try {
          fs.unlinkSync(filePath)
          deletedCount++
          logger.info(
            `[cleanup-orphaned-files] Deleted: ${file} (${formatBytes(stats.size)})`,
          )
        } catch (err) {
          logger.error(
            `[cleanup-orphaned-files] Failed to delete ${file}: ${err}`,
          )
        }
      }
    }

    const summary = DRY_RUN
      ? `[DRY RUN] Would delete ${orphanedFiles.length} files (${formatBytes(totalSizeBytes)})`
      : `Deleted ${deletedCount}/${orphanedFiles.length} files (${formatBytes(totalSizeBytes)})`

    logger.info(`[cleanup-orphaned-files] ${summary}`)
    logger.info(
      `[cleanup-orphaned-files] To actually delete files, set CLEANUP_DRY_RUN=false`,
    )
  } catch (error) {
    logger.error(`[cleanup-orphaned-files] Error: ${error}`)
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export const config = {
  name: "cleanup-orphaned-files",
  // Run every Sunday at 3:00 AM
  schedule: "0 3 * * 0",
}
