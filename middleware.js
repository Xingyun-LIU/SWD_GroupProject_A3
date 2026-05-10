import { NextResponse } from "next/server";

// 定义哪些路由需要保护
const studentRoutes = ["/student"]; // 学生和管理员都能访问
const adminRoutes = ["/admin"]; // 只有管理员能访问

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 判断当前路径是否需要保护
  const isStudentRoute = studentRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // 不需要保护的路由，直接放行
  if (!isStudentRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  // 构建绝对路径（服务器端 fetch 必须是绝对路径）
  const baseUrl = request.nextUrl.origin; // 例如 http://localhost:3000

  try {
    // 带着当前请求的 cookie 去请求 /api/auth/this，验证当前用户身份
    const res = await fetch(`${baseUrl}/api/auth/this`, {
      headers: {
        // 把浏览器传来的 cookie 原样转发给 /api/auth/this
        cookie: request.headers.get("cookie") || "",
      },
    });

    // 如果 /api/auth/this 返回非 200，说明未登录或 session 无效
    if (!res.ok) {
      // 未登录 → 跳转到登录页
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const data = await res.json();
    const user = data; // 从响应中取出用户信息，包含 role

    // 用户被封禁 → 跳转到登录页
    if (user.status === "disabled") {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // 访问 /admin/* 但角色不是 admin → 拒绝访问
    if (isAdminRoute && user.role !== "admin") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }

    // 验证通过 → 放行
    return NextResponse.next();
  } catch (error) {
    // fetch 出错（比如服务器挂了）→ 跳转到登录页
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

// 配置哪些路径触发这个 middleware
export const config = {
  matcher: [
    "/student/:path*", // 匹配所有 /student/ 开头的路由
    "/admin/:path*", // 匹配所有 /admin/ 开头的路由
  ],
};