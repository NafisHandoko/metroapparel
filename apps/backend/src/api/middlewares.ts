import { authenticate, defineMiddlewares } from "@medusajs/framework/http";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/metro-addon-catalog",
      middlewares: [
        authenticate("user", ["session", "bearer", "api-key"]),
      ],
    },
    {
      matcher: "/admin/metro-collar-catalog",
      middlewares: [
        authenticate("user", ["session", "bearer", "api-key"]),
      ],
    },
    {
      matcher: "/admin/metro-site-company",
      middlewares: [
        authenticate("user", ["session", "bearer", "api-key"]),
      ],
    },
    {
      matcher: "/admin/metro-site-gallery",
      middlewares: [
        authenticate("user", ["session", "bearer", "api-key"]),
      ],
    },
    {
      matcher: "/admin/metro-site-hero",
      middlewares: [
        authenticate("user", ["session", "bearer", "api-key"]),
      ],
    },
    {
      matcher: "/admin/metro-site-clients",
      middlewares: [
        authenticate("user", ["session", "bearer", "api-key"]),
      ],
    },
    {
      matcher: "/admin/metro-site-testimonials",
      middlewares: [
        authenticate("user", ["session", "bearer", "api-key"]),
      ],
    },
    {
      matcher: "/admin/metro-site-faq",
      middlewares: [
        authenticate("user", ["session", "bearer", "api-key"]),
      ],
    },
  ],
});
