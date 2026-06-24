import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 创建 admin 用户
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: { nickname: "Ddmer" },
    create: {
      username: "admin",
      hashed_password: adminPassword,
      nickname: "Ddmer",
      is_admin: true,
    },
  });

  // 创建 ddmer 用户
  const ddmerPassword = await bcrypt.hash("skmbm123", 10);
  await prisma.user.upsert({
    where: { username: "ddmer" },
    update: {},
    create: {
      username: "ddmer",
      hashed_password: ddmerPassword,
      nickname: "ddmer",
      is_admin: true,
    },
  });

  // 创建默认站点配置
  const siteConfigs = [
    { key: "title", value: "Ddmer小站", description: "网站标题" },
    { key: "url", value: "https://ddmer.ccwu.cc/", description: "网站地址" },
    { key: "authorName", value: "Ddmer", description: "作者名" },
    { key: "bio", value: "这里是 Ddmer 的个人博客，记录技术、生活与点滴思考。", description: "个人简介" },
    { key: "avatarUrl", value: "", description: "头像图片地址（空则使用默认）" },
    { key: "useGradient", value: "false", description: "是否使用渐变背景" },
    { key: "themeColors", value: JSON.stringify(["#a18cd1", "#fbc2eb", "#a1c4fd", "#c2e9fb"]), description: "主题颜色数组" },
    { key: "bgImages", value: "[]", description: "背景图片地址数组（JSON）" },
    { key: "defaultPostCover", value: "", description: "文章默认封面图（空则使用默认）" },
    { key: "photoWallImage", value: "", description: "照片墙预览图（空则使用默认）" },
    { key: "cloudMusicPlaylistId", value: "18048723813", description: "网易云音乐歌单ID" },
    { key: "cloudMusicIds", value: "[]", description: "网易云音乐歌曲ID数组（JSON）" },
    { key: "apiBaseUrl", value: "", description: "后端API地址（空则使用当前域名）" },
    { key: "social_github", value: "https://github.com/wryygx", description: "GitHub链接" },
    { key: "social_bilibili", value: "https://space.bilibili.com/384763636", description: "Bilibili链接" },
    { key: "social_email", value: "ddmer8975@gmail.com", description: "邮箱地址" },
    { key: "social_x", value: "https://x.com/ddmerx", description: "X(Twitter)链接" },
    { key: "social_youtube", value: "https://www.youtube.com/@ddmer-s2i", description: "YouTube链接" },
    { key: "icp_name", value: "赣ICP备2025078417号", description: "ICP备案号" },
    { key: "icp_link", value: "https://beian.miit.gov.cn/", description: "ICP备案链接" },
    { key: "moeIcp_name", value: "萌ICP备20260527号", description: "萌ICP备案号" },
    { key: "moeIcp_link", value: "https://icp.gov.moe/?keyword=20260527", description: "萌ICP备案链接" },
    { key: "chatterTitle", value: "留言", description: "说说/留言页面标题" },
    { key: "chatterDescription", value: "生活、技术、随想的碎片记录", description: "说说/留言页面描述" },
  ];

  for (const cfg of siteConfigs) {
    await prisma.siteConfig.upsert({
      where: { key: cfg.key },
      update: {},
      create: cfg,
    });
  }

  console.log("Seed completed: admin/ddmer users and site configs created.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
