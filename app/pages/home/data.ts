import articlesJson from '../article/articles.json'
import practicesJson from '../practice-areas/practices.json'

export const heroData = {
  title: '以卓越法律实力塑造商事争议解决的未来',
  description:
    '青颂致力于帮助世界各地的企业与机构应对最复杂的商事诉讼与仲裁挑战。从跨国企业到创新型公司——客户选择青颂，是因为我们以策略、执行力和结果为导向，在最关键的时刻赢得胜利。',
}

// 执业领域轮播数据（来自 practices.json）
const practiceImages = [
  '/about/image1/7.jpg',
  '/about/image1/8.jpg',
  '/about/image1/5.jpg',
  '/pic_best/2.png',
  '/about/image1/11.jpg',
  '/about/image1/12.jpg',
]

const practiceCategories = [
  'FOREIGN INVESTMENT & M&A',
  'COMMERCIAL DISPUTE RESOLUTION',
  'JUDGMENT ENFORCEMENT',
  'SPORTS & ENTERTAINMENT LAW',
  'DEBT RESTRUCTURING',
  'TAX SERVICES',
]

export const serviceCarouselItems = practicesJson.map((p, idx) => ({
  id: p.slug,
  image: practiceImages[idx % practiceImages.length],
  category: practiceCategories[idx % practiceCategories.length],
  title: p.name,
  link: `/practice-areas/${p.slug}`,
}))

export const impactTabs = [
  {
    id: 'team',
    label: '专业团队',
    bricks: [
      { value: '20 +', label: '拥有专业律师 20 名，相关领域经验丰富', span: 6 },
      { value: '10 +', label: '与全球 10 多个国家的律师事务所建立紧密合作', span: 6 },
      { value: '2004', label: '自 2004 年成立以来，深耕法律服务领域 20 余载', span: 4 },
      { value: '100%', label: '公司化运营的精品律师事务所，全流程品质把控', span: 4 },
      { value: '全方位', label: '提供全方位的法律服务，覆盖商事争议全链条', span: 4 },
    ],
  },
  {
    id: 'efficiency',
    label: '高效服务',
    bricks: [
      { value: '24h', label: '紧急法律需求 24 小时内响应并组建专项团队', span: 8 },
      { value: '客户至上', label: '始终以客户需求为核心，量身定制解决方案', span: 4 },
      { value: '专业高效', label: '充分发挥专业团队优势，提供高效高质服务', span: 4 },
      { value: '全球网络', label: '利用国内及海外合作资源，满足境内外多元化需求', span: 8 },
    ],
  },
  {
    id: 'fields',
    label: '卓越领域',
    bricks: [
      { value: '涉外', label: '涉外法律咨询领域拥有丰富国际协作经验', span: 6 },
      { value: '争议解决', label: '商事争议解决领域策略精准、执行力强', span: 6 },
      { value: '执行', label: '执行领域深入钻研，破解执行难题', span: 6 },
      { value: '体育', label: '体育法律服务领域提供卓越成效的专业支持', span: 6 },
    ],
  },
  {
    id: 'values',
    label: '核心价值观',
    bricks: [
      { value: '客户至上', label: '始终以客户需求为核心，提供超越期待的服务', span: 4 },
      { value: '专业高效', label: '凭借深厚专业功底，高效解决复杂法律问题', span: 8 },
      { value: '勤勉尽责', label: '不轻言放弃，始终怀揣解决问题的信念，努力！', span: 8 },
      { value: '开拓创新', label: '坚持走规范化、专业化、国际化的发展道路', span: 4 },
    ],
  },
]

export const philosophyData = {
  title: '我们的服务理念与执业承诺',
  description:
    '青颂始终秉持"客户至上、专业高效、勤勉尽责、开拓创新、合作共赢"的服务理念。我们相信，凭借着卓越的业务水平和真诚奋进的服务态度，青颂可以是您最信赖的合作伙伴之一。',
  ctaText: '进入我们的服务页',
  ctaHref: '/practice-areas',
}

// 首页优势卡片 - 取自真实文章（前3篇）
const articleImages = ['/article/12.jpg', '/article/16.jpg', '/about/image1/7.jpg']

export const advantageCards = articlesJson.slice(0, 3).map((article, idx) => {
  const desc = article.lead.length > 80 ? article.lead.slice(0, 80) + '…' : article.lead
  return {
    id: article.slug,
    title: article.title,
    description: desc,
    image: articleImages[idx % articleImages.length],
    link: `/article/${article.slug}`,
  }
})

export const timelineTabs = [
  {
    id: '2004-2010',
    label: '2004 – 2010',
    events: [
      { year: '2004 年', description: '北京青颂律师事务所经北京市司法局批准设立，以合伙制形式开启专业化运营之路。' },
      { year: '2006 年', description: '青颂确立公司化运营模式，打造精品律师事务所管理体系。' },
      { year: '2008 年', description: '青颂首次与国际律师事务所建立合作关系，开启涉外法律服务布局。' },
    ],
  },
  {
    id: '2011-2018',
    label: '2011 – 2018',
    events: [
      { year: '2012 年', description: '青颂涉外法律咨询业务取得突破性进展，服务网络扩展至欧洲与亚太地区。' },
      { year: '2014 年', description: '青颂在争议解决领域树立行业口碑，成为众多企业信赖的法律合作伙伴。' },
      { year: '2016 年', description: '青颂体育法律服务团队成立，为赛事运营与体育机构提供专业法律支持。' },
      { year: '2018 年', description: '青颂执行领域法律服务形成特色优势，帮助客户有效实现胜诉权益。' },
    ],
  },
  {
    id: '2019-2025',
    label: '2019 – 2025',
    events: [
      { year: '2020 年', description: '青颂深化公司化运营，完善专业分工与协作机制，服务品质再上新台阶。' },
      { year: '2022 年', description: '青颂与全球 10 多个国家律师事务所建立紧密合作关系，国际化程度大幅提升。' },
      { year: '2024 年', description: '青颂成立 20 周年，专业律师团队扩充至 20 名，服务能力全面跃升。' },
      { year: '2025 年', description: '青颂践行 ESG 理念，将社会责任融入律所发展战略，推动可持续发展。' },
    ],
  },
]

export const esgData = {
  title: '践行 ESG 理念 促进个人与社会环境健康可持续发展',
  paragraphs: [
    '青颂感恩社会对自身的培育，也十分珍视对社会的回馈，在追求法律服务上不断突破的同时，我们始终将社会责任视为己任，就如同我们全力以赴地为客户提供卓越法律服务一样。',
    '从绿色办公到节能减排，从关注个体到投身公益，青颂在履行社会责任、追求可持续发展的道路上坚定前行。青颂关心并重视每位员工的职业发展与身心健康，并从员工的不同学历背景、社会经验、知识与技能的多样性中汲取力量。在青颂，每位员工都拥有平等的发展机会与话语权，在律所的平台上共同向上生长。',
  ],
}
