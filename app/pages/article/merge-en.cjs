const fs = require('fs');

const ARTICLES_JSON = './articles.json';

// Missing translations to fill in
const MISSING_TRANSLATIONS = {
  'article-003': {
    blocks: {
      11: "However, conversely, if the person subjected to execution had already donated property to others before signing the contract, and at the time of entering into the debt contract, the creditor had examined the other party's (i.e., the person subjected to execution's) goodwill and still decided to conduct business, this constitutes the creditor's failure to exercise due diligence, and the creditor should bear the transaction risk itself and may not revoke the gift of the person subjected to execution.",
      34: {
        content: "In the case of (2025) Xin 40 Xing Zhong No. 9, the court held that the defendant Chen Moujia, in order to evade responsibility, after receiving the notice from the court adding him as the person subjected to execution, knowing that his real estate had unpaid bank loans and that his property was insufficient to pay off the debts to the applicant for execution Yang Mouyi, still sold the real estate and required the purchaser to pay the sale proceeds in cash to his son. The subjective intention to transfer and conceal property to evade court execution was obvious, resulting in the effective ruling of the people's court being unenforceable, which constitutes a serious circumstance and has constituted the crime of refusing to execute judgments and rulings, and should be punished according to law."
      }
    }
  },
  'article-007': {
    blocks: {
      28: "However, according to China's judicial practice of recognizing and enforcing foreign effective arbitral awards, China adopts a prudent attitude towards public policy defenses, and it is difficult to obtain support for such defenses. Currently, only in the case of (2008) Min Si Ta Zi No. 11, the Supreme People's Court held that under the circumstances where the relevant Chinese courts had ruled to preserve the property of the joint venture company and rendered a judgment in the lease contract dispute between Jinan Yongning Pharmaceutical Co., Ltd. and the joint venture company Jinan-Haimofam Pharmaceutical Co., Ltd., the Arbitration Court of the International Chamber of Commerce further adjudicated and ruled on the lease contract dispute between Jinan Yongning Pharmaceutical Co., Ltd. and the joint venture company Jinan-Haimofam Pharmaceutical Co., Ltd., which infringed upon China's judicial sovereignty and the judicial jurisdiction of Chinese courts. In accordance with the provisions of Article 5, paragraphs 1 (c) and 2 (b), of the 1958 New York Convention, it refused to recognize and enforce the arbitral award No. 13464/MS/JB/JEM of the Arbitration Court of the International Chamber of Commerce.",
      37: "(2016) Liao 02 Xie Wai Ren No. 2 Case",
      63: "•New \"presumed reciprocity\": In recent years, the Supreme People's Court tends to adopt a lenient standard of determination. As long as there is no evidence proving that the other party has refused to recognize Chinese awards, reciprocity may be presumed to exist."
    }
  },
  'article-008': {
    blocks: {
      23: {
        title: "Viewpoint 1: Joint and several liability shall be borne",
        content: ""
      },
      27: {
        title: "Viewpoint 2: There is no legal basis for joint and several liability",
        content: ""
      },
      28: {
        content: "In the case of (2021) Su 0981 Min Chu No. 6655, in the dispute over decoration and construction contract between plaintiff Gold Mantis Company and defendants Hengguan Company, Evergrande Nanjing Company, and Evergrande Company, the court held that regarding whether Evergrande Nanjing Company and Evergrande Company should bear liability. Article 62 of the Company Law of the People's Republic of China stipulates that a one-person limited liability company shall prepare financial and accounting reports at the end of each fiscal year and shall be audited by an accounting firm. Article 63 stipulates that if a shareholder of a one-person limited liability company is unable to prove that the company's property is independent of the shareholder's own property, he shall be jointly and severally liable for the debts of the company. In this case, since Hengguan Company is a one-person limited company, its shareholder is Evergrande Nanjing Company, and Evergrande Nanjing Company fails to provide sufficient evidence to prove that the company's property is independent of its property, it shall be jointly and severally liable for the above-mentioned debts of Hengguan Company. Regarding Gold Mantis Company's request for Evergrande Company to bear joint and several liability. According to the provisions of paragraph 3 of Article 178 of the Civil Code of the People's Republic of China, joint and several liability shall be stipulated by law or agreed upon by the parties. There is no clear agreement in law on whether the sole proprietorship shareholders of a one-person limited company shall bear joint and several liability, nor has Merid provided evidence to prove that both parties have agreed on this, so the Court does not support it according to law."
      }
    }
  },
  'article-009': {
    blocks: {
      12: "In the case of (2021) Supreme People's Court Min Zai No. 342, the court of second instance held that Jinyuan Trading Company, Huiye Trading Company, and Yongxing Instrument Factory appeared to be independent from each other on the surface, but all three companies (or factories) were controlled by Sun Heping or his immediate family members. Sun Heping or his immediate family members, as the controlling shareholders or actual controllers, controlled the three companies (or factories), abused their control rights, resulting in unclear property boundaries among the three companies (or factories), mutual transfer of interests, loss of independent personality, and becoming tools for evading debts, seriously damaging the interests of the creditors of Jinyuan Trading Company. Therefore, the judgment of first instance, on the grounds that Jinyuan Trading Company, the former Jinyuan Trading Company, Huiye Trading Company, and others had mixed personality and property, did not support the claims of Huiye Trading Company and Yongxing Instrument Factory to exclude the execution of the part of compensation for the demolition and relocation of collective land use rights and temporary buildings involved in the case, which had corresponding factual and legal basis. The judgment of second instance was wrong to modify the original judgment, and the Supreme People's Court corrected it.",
      15: {
        content: "In the case of (2019) Su Min Zhong No. 1528, regarding whether Guofa Energy Conservation Company, Guofa Logistics Company, Guo Liucheng, and Guofa China Enterprise Company had mixed personalities, and whether they should bear joint and several liability for the repayment of the debts involved in the case owed by Guofa China Enterprise Company to Guodian Photovoltaic Company, the court held that after trial, the court made clear determinations on the relationship and liability bearing among Guofa Energy Conservation Company, Guofa Logistics Company, Guo Liucheng, and Guofa China Enterprise Company. The specific results are as follows:"
      },
      16: "①It is determined that Guofa Energy Conservation Company, Guofa Logistics Company, and Guofa China Enterprise Company have mixed personalities and shall bear joint and several liability for repayment.",
      19: "②It is determined that Guo Liucheng, as the actual controller, excessively dominated and controlled the companies, and shall bear joint and several liability for repayment: According to the facts ascertained in the first instance, Guo Liucheng, through the equity control chain, i.e., holding 97.83% of the equity of Guofa Logistics Company, Guofa Logistics Company holding 99.69% of the equity of Guofa Energy Conservation Company, and Guofa Energy Conservation Company holding 93.75% of the equity of Guofa China Enterprise Company, was able to actually control and dominate Guofa Energy Conservation Company and Guofa China Enterprise Company, and at the same time served as a personal shareholder of both companies and held senior management positions. In accordance with the provisions of paragraph 1 of Article 108 of the Interpretation of the Supreme People's Court on the Application of the Civil Procedure Law of the People's Republic of China, it is highly probable that Guo Liucheng is the actual controller of the three companies. Guofa Energy Conservation Company, Guofa Logistics Company, and Guo Liucheng appealed to deny but failed to provide rebuttal evidence, and shall bear adverse consequences. Guo Liucheng, as the actual controller, excessively dominated and controlled the companies, resulting in unclear property boundaries, financial confusion, and loss of independent personality among the three companies, leading to Guofa China Enterprise Company's inability to pay off the large debts owed to Guodian Photovoltaic Company, which seriously damaged the interests of the company's creditors. Therefore, he shall bear joint and several liability for the company's debts."
    }
  }
};

function main() {
  const data = JSON.parse(fs.readFileSync(ARTICLES_JSON, 'utf-8'));
  
  const slugs = ['article-003', 'article-004', 'article-005', 'article-006', 'article-007', 'article-008', 'article-009'];
  
  for (const slug of slugs) {
    const enData = JSON.parse(fs.readFileSync(`./en_${slug}.json`, 'utf-8'));
    const article = data.find(a => a.slug === slug);
    
    if (!article) {
      console.log(`WARNING: ${slug} not found in articles.json`);
      continue;
    }
    
    // Build en translations
    const enTranslations = {
      title: enData.title,
      lead: enData.lead,
      subtitle: enData.subtitle || '',
      meta: {
        date: article.translations.zh.meta.date,
        author: 'Qingsong Law Firm'
      },
      blocks: enData.blocks.map((b, i) => {
        const zhBlock = article.translations.zh.blocks[i];
        const block = { type: b.type };
        
        // Fill missing translations
        const missing = MISSING_TRANSLATIONS[slug]?.blocks?.[i];
        
        if (b.type === 'case') {
          block.badge = zhBlock.badge;
          block.caseId = zhBlock.caseId;
          block.content = b.content || (missing?.content || missing) || '';
        } else if (b.type === 'viewpoint') {
          block.title = b.title || missing?.title || zhBlock.title || '';
          block.content = b.content || missing?.content || '';
        } else {
          block.text = b.text || missing || '';
        }
        
        return block;
      }),
      conclusion: enData.conclusion,
      references: enData.references
    };
    
    article.translations.en = enTranslations;
    console.log(`Merged ${slug}: ${enTranslations.blocks.length} blocks`);
  }
  
  fs.writeFileSync(ARTICLES_JSON, JSON.stringify(data, null, 2), 'utf-8');
  console.log('\nAll articles merged successfully!');
}

main();
