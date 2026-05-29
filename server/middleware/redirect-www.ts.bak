/**
 * 域名级 301 重定向：qs-legal.com → www.qs-legal.com
 * 
 * 作用：
 * - 统一域名，避免 www 和裸域名被百度视为两个独立站点
 * - 传递 SEO 权重到主域名
 * 
 * 注意：
 * - 开发环境（localhost/127.x）不重定向
 * - 返回真正的 HTTP 301 状态码，不是 JS 跳转
 */
export default defineEventHandler((event) => {
  const host = getHeader(event, 'host') || ''

  // 开发环境不重定向
  if (host.startsWith('localhost') || host.startsWith('127.')) {
    return
  }

  // 裸域名（不带 www）301 重定向到 www
  if (host === 'qs-legal.com' || host.startsWith('qs-legal.com:')) {
    const url = getRequestURL(event)
    url.host = 'www.qs-legal.com'
    return sendRedirect(event, url.toString(), 301)
  }
})
