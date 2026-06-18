import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const url = request.nextUrl;

  // ── 安全响应头 ──
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "0"); // 现代浏览器已弃用，设为 0 避免误报
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // 生产环境强制 HTTPS
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // ── API 路由缓存策略 ──
  if (url.pathname.startsWith("/api/")) {
    // 公共只读 API：CDN 缓存 60 秒
    const publicGetPaths = [
      "/api/posts",
      "/api/categories",
      "/api/tags",
      "/api/chatters",
      "/api/messages/count",
      "/api/friend-links/public",
      "/api/site-config/list",
      "/api/albums",
      "/api/projects",
      "/api/bookmarks",
      "/api/music",
      "/api/dashboard/profile-stats",
      "/api/visitors/record",
    ];

    const isPublicGet =
      request.method === "GET" &&
      publicGetPaths.some((p) => url.pathname.startsWith(p));

    if (isPublicGet) {
      response.headers.set(
        "Cache-Control",
        "public, max-age=60, stale-while-revalidate=30"
      );
    } else if (request.method === "GET") {
      // 其他 GET API（如单个资源）：不缓存
      response.headers.set("Cache-Control", "no-store, must-revalidate");
    }
  }

  // ── 静态资源长缓存 ──
  if (
    url.pathname.startsWith("/admin/static") ||
    url.pathname.match(/\.(js|css|woff2?|ttf|svg|ico)$/)
  ) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  }

  // ── 图片资源缓存 ──
  if (url.pathname.startsWith("/images/") || url.pathname.startsWith("/uploads/")) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=86400, stale-while-revalidate=3600"
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (Next.js 静态文件，已有缓存策略)
     * - _next/image (Next.js 图片优化)
     * - favicon.ico
     * - live2d 资源（文件较大，由 CDN 处理）
     */
    "/((?!_next/static|_next/image|favicon.ico|live2d).*)",
  ],
};
