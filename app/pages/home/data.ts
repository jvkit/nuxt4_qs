import type { Locale } from '~/composables/useLocale'
import articlesJson from '../article/articles.json'

// 执业领域名称映射（中→英），与 practices.json 的 translations.en.name 保持一致
const practiceAreaTitleMap: Record<string, string> = {
  '涉外法律咨询': 'Legal Advisory Services on Foreign Related Matters',
  '商事争议解决': 'Dispute Resolution (Litigation and Arbitration)',
  '强制执行': 'Enforcement',
  '体育专项法律服务': 'Sports Related Legal Service',
  '债务重组及不良资产处置': 'Debt Restructuring and Disposal of Non-performing Assets',
  '税法服务': 'Tax Legal Services',
}

// 执业领域轮播数据（手动配置，方便一一对应图片与内容）
export function getServiceCarouselItems(locale: Locale) {
  const isZh = locale === 'zh'
  const items = [
    { image: '/images/home/services/foreign-investment.avif', category: 'FOREIGN INVESTMENT & M&A', titleZh: '涉外法律咨询', titleEn: 'Legal Advisory Services on Foreign Related Matters', link: '/practice-areas/涉外法律咨询' },
    { image: '/images/home/services/8.jpg', category: 'COMMERCIAL DISPUTE RESOLUTION', titleZh: '商事争议解决', titleEn: 'Dispute Resolution (Litigation and Arbitration)', link: '/practice-areas/商事争议解决' },
    { image: '/images/home/services/wz.png', category: 'JUDGMENT ENFORCEMENT', titleZh: '强制执行', titleEn: 'Enforcement', link: '/practice-areas/强制执行' },
    { image: '/images/home/services/pe.jpg', category: 'SPORTS & ENTERTAINMENT LAW', titleZh: '体育专项法律服务', titleEn: 'Sports Related Legal Service', link: '/practice-areas/体育专项法律服务' },
    { image: '/images/home/services/11.jpg', category: 'DEBT RESTRUCTURING', titleZh: '债务重组及不良资产处置', titleEn: 'Debt Restructuring and Disposal of Non-performing Assets', link: '/practice-areas/债务重组及不良资产处置' },
    { image: '/images/home/services/12.jpg', category: 'TAX SERVICES', titleZh: '税法服务', titleEn: 'Tax Legal Services', link: '/practice-areas/税法服务' },
  ]
  return items.map(item => ({
    image: item.image,
    category: item.category,
    title: isZh ? item.titleZh : item.titleEn,
    link: item.link,
  }))
}

export function getHomeData(locale: Locale) {
  const isZh = locale === 'zh'

  return {
    heroData: {
      title: isZh
        ? '以卓越法律实力塑造商事争议解决的未来'
        : 'Shaping the Future of Commercial Dispute Resolution with Legal Excellence',
      description: isZh
        ? '青颂致力于帮助世界各地的企业与机构应对最复杂的商事诉讼与仲裁挑战。从跨国企业到创新型公司——客户选择青颂，是因为我们以策略、执行力和结果为导向，在最关键的时刻赢得胜利。'
        : 'QingSong is committed to helping businesses and institutions worldwide navigate the most complex commercial litigation and arbitration challenges. From multinational corporations to innovative startups—clients choose QingSong because we are strategy-driven, execution-focused, and results-oriented, delivering victories at the most critical moments.',
    },

    impactTabs: [
      {
        id: 'team',
        label: isZh ? '专业团队' : 'Our Team',
        bricks: [
          { value: '20 +', label: isZh ? '拥有专业律师 20 名，相关领域经验丰富' : '20+ seasoned attorneys with extensive experience', span: 6 },
          { value: '10 +', label: isZh ? '与全球 10 多个国家的律师事务所建立紧密合作' : 'Close partnerships with law firms in 10+ countries', span: 6 },
          { value: '2004', label: isZh ? '自 2004 年成立以来，深耕法律服务领域 20 余载' : 'Over 20 years of dedicated legal service since 2004', span: 4 },
          { value: '100%', label: isZh ? '公司化运营的精品律师事务所，全流程品质把控' : 'A boutique firm with corporate management', span: 4 },
          { value: isZh ? '全方位' : 'Full Chain', label: isZh ? '提供全方位的法律服务，覆盖商事争议全链条' : 'Comprehensive legal services covering the full chain', span: 4 },
        ],
      },
      {
        id: 'efficiency',
        label: isZh ? '高效服务' : 'Efficient Service',
        bricks: [
          { value: '24h', label: isZh ? '紧急法律需求 24 小时内响应并组建专项团队' : 'Emergency legal needs responded within 24 hours', span: 8 },
          { value: isZh ? '客户至上' : 'Client First', label: isZh ? '始终以客户需求为核心，量身定制解决方案' : 'Client-centric with tailored solutions', span: 4 },
          { value: isZh ? '专业高效' : 'Excellence', label: isZh ? '充分发挥专业团队优势，提供高效高质服务' : 'Leveraging our team for efficient, high-quality service', span: 4 },
          { value: isZh ? '全球网络' : 'Global Network', label: isZh ? '利用国内及海外合作资源，满足境内外多元化需求' : 'Utilizing domestic and international resources', span: 8 },
        ],
      },
      {
        id: 'fields',
        label: isZh ? '卓越领域' : 'Areas of Excellence',
        bricks: [
          { value: isZh ? '涉外' : 'Foreign', label: isZh ? '涉外法律咨询领域拥有丰富国际协作经验' : 'Extensive international collaboration in foreign-related legal consulting', span: 6 },
          { value: isZh ? '争议解决' : 'Disputes', label: isZh ? '商事争议解决领域策略精准、执行力强' : 'Precise strategies and strong execution in dispute resolution', span: 6 },
          { value: isZh ? '执行' : 'Enforcement', label: isZh ? '执行领域深入钻研，破解执行难题' : 'Deep expertise in enforcement, cracking tough challenges', span: 6 },
          { value: isZh ? '体育' : 'Sports', label: isZh ? '体育法律服务领域提供卓越成效的专业支持' : 'Professional sports law services delivering outstanding results', span: 6 },
        ],
      },
      {
        id: 'values',
        label: isZh ? '核心价值观' : 'Core Values',
        bricks: [
          { value: isZh ? '客户至上' : 'Client First', label: isZh ? '始终以客户需求为核心，提供超越期待的服务' : 'Delivering service that exceeds expectations', span: 4 },
          { value: isZh ? '专业高效' : 'Excellence', label: isZh ? '凭借深厚专业功底，高效解决复杂法律问题' : 'Solving complex legal issues with deep expertise', span: 8 },
          { value: isZh ? '勤勉尽责' : 'Diligence', label: isZh ? '不轻言放弃，始终怀揣解决问题的信念，努力！' : 'Never giving up, always believing in solutions', span: 8 },
          { value: isZh ? '开拓创新' : 'Innovation', label: isZh ? '坚持走规范化、专业化、国际化的发展道路' : 'Pursuing standardization, specialization, and internationalization', span: 4 },
        ],
      },
    ],

    philosophyData: {
      title: isZh ? '我们的服务理念与执业承诺' : 'Our Service Philosophy & Commitment',
      description: isZh
        ? '青颂始终秉持"客户至上、专业高效、勤勉尽责、开拓创新、合作共赢"的服务理念。我们相信，凭借着卓越的业务水平和真诚奋进的服务态度，青颂可以是您最信赖的合作伙伴之一。'
        : 'QingSong upholds the service philosophy of "Client First, Professional Excellence, Diligence & Responsibility, Innovation, and Win-Win Cooperation." We believe that with outstanding expertise and sincere dedication, QingSong can be one of your most trusted partners.',
      ctaText: isZh ? '进入我们的服务页' : 'Explore Our Services',
      ctaHref: '/practice-areas',
    },

    timelineTabs: [
      {
        id: '2004-2010',
        label: '2004 – 2010',
        events: [
          { year: '2004', description: isZh ? '北京青颂律师事务所经北京市司法局批准设立，以合伙制形式开启专业化运营之路。' : 'Beijing QingSong Law Firm was established with the approval of the Beijing Municipal Bureau of Justice.' },
          { year: '2006', description: isZh ? '青颂确立公司化运营模式，打造精品律师事务所管理体系。' : 'QingSong adopted a corporate management model, building a boutique law firm management system.' },
          { year: '2008', description: isZh ? '青颂首次与国际律师事务所建立合作关系，开启涉外法律服务布局。' : 'QingSong established its first international law firm partnerships, launching foreign-related legal services.' },
        ],
      },
      {
        id: '2011-2018',
        label: '2011 – 2018',
        events: [
          { year: '2012', description: isZh ? '青颂涉外法律咨询业务取得突破性进展，服务网络扩展至欧洲与亚太地区。' : "QingSong's foreign-related legal consulting achieved breakthrough growth, extending to Europe and Asia-Pacific." },
          { year: '2014', description: isZh ? '青颂在争议解决领域树立行业口碑，成为众多企业信赖的法律合作伙伴。' : 'QingSong built a strong reputation in dispute resolution, becoming a trusted partner for enterprises.' },
          { year: '2016', description: isZh ? '青颂体育法律服务团队成立，为赛事运营与体育机构提供专业法律支持。' : 'QingSong established its Sports Law team, providing professional legal support for sports events and institutions.' },
          { year: '2018', description: isZh ? '青颂执行领域法律服务形成特色优势，帮助客户有效实现胜诉权益。' : "QingSong's enforcement practice developed distinctive strengths, helping clients realize judgment rights." },
        ],
      },
      {
        id: '2019-2025',
        label: '2019 – 2025',
        events: [
          { year: '2020', description: isZh ? '青颂深化公司化运营，完善专业分工与协作机制，服务品质再上新台阶。' : 'QingSong deepened corporate operations, refining professional division of labor and collaboration.' },
          { year: '2022', description: isZh ? '青颂与全球 10 多个国家律师事务所建立紧密合作关系，国际化程度大幅提升。' : 'QingSong established close partnerships with law firms in 10+ countries, significantly enhancing international reach.' },
          { year: '2024', description: isZh ? '青颂成立 20 周年，专业律师团队扩充至 20 名，服务能力全面跃升。' : "QingSong celebrated its 20th anniversary, expanding its team to 20 attorneys." },
          { year: '2025', description: isZh ? '青颂践行 ESG 理念，将社会责任融入律所发展战略，推动可持续发展。' : "QingSong practices ESG principles, integrating social responsibility into its development strategy." },
        ],
      },
    ],

    esgData: {
      title: isZh
        ? '践行 ESG 理念 促进个人与社会环境健康可持续发展'
        : 'Practicing ESG Principles for Sustainable Development',
      paragraphs: [
        isZh
          ? '青颂感恩社会对自身的培育，也十分珍视对社会的回馈，在追求法律服务上不断突破的同时，我们始终将社会责任视为己任，就如同我们全力以赴地为客户提供卓越法律服务一样。'
          : 'QingSong is grateful for society\'s nurturing and cherishes the opportunity to give back. While pushing the boundaries of legal services, we always regard social responsibility as our mission.',
        isZh
          ? '从绿色办公到节能减排，从关注个体到投身公益，青颂在履行社会责任、追求可持续发展的道路上坚定前行。青颂关心并重视每位员工的职业发展与身心健康，并从员工的不同学历背景、社会经验、知识与技能的多样性中汲取力量。在青颂，每位员工都拥有平等的发展机会与话语权，在律所的平台上共同向上生长。'
          : 'From green office initiatives to energy conservation, from caring for individuals to public welfare, QingSong advances on the path of social responsibility. We care about every employee\'s growth and well-being, drawing strength from diversity.',
      ],
    },
  }
}

// 首页优势卡片 - 取自真实文章（前3篇）
const articleImages = ['/images/article/covers/12.jpg', '/images/article/covers/16.jpg', '/images/home/advantages/7.jpg']

export function getAdvantageCards(locale: Locale) {
  const isZh = locale === 'zh'
  return articlesJson.slice(0, 3).map((article: any, idx: number) => {
    const tr = article.translations?.[locale] || article.translations?.zh || article
    const lead = tr.lead || ''
    const desc = lead.length > 80 ? lead.slice(0, 80) + '…' : lead
    return {
      id: article.slug,
      title: tr.title || article.slug,
      description: desc,
      image: articleImages[idx % articleImages.length],
      link: `/article/${article.slug}`,
    }
  })
}
