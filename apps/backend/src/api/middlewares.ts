import { authenticate, defineMiddlewares } from "@medusajs/framework/http";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/metro-addon-catalog",
      middlewares: [
        authenticate("user", ["session", "bearer", "api-key"]),
      ],
    },
  ],
});
