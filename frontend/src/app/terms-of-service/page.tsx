"use client";

import { type Language, useLanguage } from "@/src/context/LanguageContext";
import { PublicUserNav } from "@/src/components/figma/PublicUserNav";
import { Footer } from "@/src/components/figma/Footer";

type Section = {
  title: string;
  paragraphs: string[];
  list?: string[];
};

const content: Record<
  Language,
  {
    eyebrow: string;
    title: string;
    intro: string;
    updated: string;
    sections: Section[];
    contactTitle: string;
    contactBody: string;
    contactEmail: string;
  }
> = {
  sq: {
    eyebrow: "Ligjore",
    title: "Kushtet e Përdorimit",
    intro:
      "Këto Kushte Përdorimi përcaktojnë rregullat për përdorimin e DiversiHire, duke përfshirë krijimin e CV-ve, krijimin e letrave motivuese, analizimin e CV-së, rekomandimet për punë, profilin e përdoruesit, pagesat dhe shërbimet e tjera të karrierës.",
    updated: "Përditësuar së fundmi: Maj 2026",
    sections: [
      {
        title: "1. Pranimi i kushteve",
        paragraphs: [
          "Duke hyrë ose përdorur DiversiHire, ju pranoni të respektoni këto Kushte Përdorimi dhe Politikën tonë të Privatësisë.",
          "Nëse nuk jeni dakord me këto kushte, nuk duhet ta përdorni platformën.",
        ],
      },
      {
        title: "2. Përshkrimi i shërbimit",
        paragraphs: [
          "DiversiHire është një platformë online që ofron mjete për krijimin dhe redaktimin e CV-ve, krijimin e letrave motivuese, analizimin e CV-së, sugjerime të bazuara në inteligjencë artificiale dhe shërbime të tjera të lidhura me karrierën.",
          "Ne mund të ndryshojmë, përmirësojmë, pezullojmë ose heqim funksione të caktuara në çdo kohë, kur kjo është e nevojshme për mirëmbajtje, siguri, përmirësim të shërbimit ose arsye ligjore.",
        ],
      },
      {
        title: "3. Llogaritë e përdoruesit",
        paragraphs: [
          "Disa funksione kërkojnë krijimin e një llogarie. Ju jeni përgjegjës për dhënien e informacionit të saktë, ruajtjen e sigurt të fjalëkalimit dhe çdo aktivitet që ndodh përmes llogarisë suaj.",
          "Ju duhet të na njoftoni nëse dyshoni se llogaria juaj është përdorur pa autorizim. Ne mund të pezullojmë ose kufizojmë llogarinë nëse konstatojmë përdorim të paligjshëm, shkelje të këtyre kushteve ose rrezik për sigurinë e platformës.",
        ],
      },
      {
        title: "4. Përmbajtja e përdoruesit",
        paragraphs: [
          "Ju jeni përgjegjës për të gjitha të dhënat dhe materialet që vendosni në platformë, duke përfshirë CV, letra motivuese, profile, aplikime, komente, vlerësime ose informacione kompanie.",
          "Ju pranoni të mos vendosni përmbajtje të paligjshme, mashtruese, fyese, diskriminuese, që shkel të drejtat e palëve të treta, ose që përmban viruse, malware apo kod të dëmshëm.",
          "Përmbajtja personale që vendosni në CV ose letër motivuese mbetet përgjegjësia juaj. DiversiHire e përdor këtë përmbajtje vetëm për të ofruar shërbimet që kërkoni, në përputhje me Politikën e Privatësisë.",
        ],
      },
      {
        title: "5. Sugjerimet nga inteligjenca artificiale",
        paragraphs: [
          "DiversiHire mund të ofrojë sugjerime të krijuara nga inteligjenca artificiale për CV, letra motivuese, përshkrime aftësish, rekomandime pune dhe përmbajtje të tjera profesionale.",
          "Këto sugjerime ofrohen vetëm për ndihmë dhe nuk përbëjnë këshillë ligjore, financiare, profesionale apo garanci për punësim. Ju duhet të kontrolloni dhe redaktoni çdo përmbajtje të krijuar nga AI përpara përdorimit.",
        ],
      },
      {
        title: "6. Nuk garantojmë punësim",
        paragraphs: [
          "DiversiHire nuk garanton intervista, oferta pune, pranimin e aplikimeve, rritje page, rezultate specifike karriere ose vendime të caktuara nga punëdhënësit.",
          "Vendimet e punësimit merren nga punëdhënësit ose palë të treta dhe nuk kontrollohen nga DiversiHire.",
        ],
      },
      {
        title: "7. Pagesat dhe abonimet",
        paragraphs: [
          "Disa funksione mund të jenë të disponueshme përmes planeve me pagesë ose abonimeve. Çmimet, periudhat e faturimit, funksionet përkatëse, taksat e aplikueshme dhe kushtet kryesore shfaqen në faqen e çmimeve ose gjatë procesit të pagesës.",
          "Duke blerë një plan me pagesë, ju pranoni të paguani tarifat e shfaqura dhe çdo tarifë tjetër të aplikueshme. Pagesat mund të përpunohen nga ofrues të jashtëm pagesash.",
          "Nëse përdorni abonim të përsëritur, ai mund të rinovohet sipas kushteve të shfaqura në momentin e blerjes, përveç nëse anulohet sipas udhëzimeve të platformës ose ofruesit të pagesës.",
        ],
      },
      {
        title: "8. Rimbursimet, anulimet dhe të drejtat e konsumatorit",
        paragraphs: [
          "Rimbursimet, anulimet dhe të drejtat e tërheqjes trajtohen sipas ligjit të zbatueshëm, kushteve të planit të blerë dhe çdo politike rimbursimi të publikuar nga DiversiHire.",
          "Nëse një shërbim digjital fillon menjëherë pas blerjes ose është përdorur nga ju, mund të zbatohen kufizime ligjore ose kontraktuale për rimbursimin, për aq sa lejohet nga ligji.",
          "Asgjë në këto kushte nuk kufizon të drejtat e detyrueshme që mund t’ju takojnë si konsumator sipas ligjit shqiptar.",
          "Për të kërkuar rimbursim ose anulim, mund të na kontaktoni në support@diversihire.com dhe të përfshini informacionin përkatës të pagesës ose llogarisë.",
        ],
      },
      {
        title: "9. Pronësia intelektuale",
        paragraphs: [
          "Platforma DiversiHire, emri, logoja, dizajni, modelet, funksionet, teksti, pamja vizuale, softueri dhe elementet e tjera të platformës janë pronë e DiversiHire ose licencuesve të saj.",
          "Ju nuk mund të kopjoni, shisni, riprodhoni, shpërndani, modifikoni ose përdorni materialet e platformës për qëllime tregtare pa lejen tonë me shkrim.",
        ],
      },
      {
        title: "10. Përdorimi i ndaluar",
        paragraphs: [
          "Ju pranoni të mos përdorni DiversiHire për veprimtari të paligjshme, mashtrim, spam, sulme kibernetike, kopjim masiv, akses të paautorizuar në sisteme ose llogari, shkelje të privatësisë së të tjerëve ose veprime që dëmtojnë funksionimin e platformës.",
          "Gjithashtu nuk lejohet përdorimi i platformës për të gjeneruar ose shpërndarë përmbajtje të rreme, diskriminuese, fyese, kërcënuese ose që shkel të drejtat e palëve të treta.",
        ],
      },
      {
        title: "11. Shërbime dhe lidhje të palëve të treta",
        paragraphs: [
          "Platforma mund të përmbajë lidhje ose integrime me shërbime të palëve të treta, si ofrues pagesash, shërbime autentikimi, platforma punësimi, mjete analitike ose shërbime të tjera teknike.",
          "Ne nuk jemi përgjegjës për përmbajtjen, kushtet, politikat e privatësisë ose praktikat e palëve të treta. Përdorimi i këtyre shërbimeve mund t’i nënshtrohet kushteve të tyre përkatëse.",
        ],
      },
      {
        title: "12. Privatësia dhe mbrojtja e të dhënave",
        paragraphs: [
          "Përpunimi i të dhënave personale bëhet sipas Politikës sonë të Privatësisë dhe legjislacionit shqiptar për mbrojtjen e të dhënave personale, përfshirë Ligjin nr. 124/2024 ‘Për Mbrojtjen e të Dhënave Personale’.",
          "Përdorimi i platformës nuk zëvendëson pëlqimin tuaj kur ligji kërkon pëlqim të veçantë për përpunimin e të dhënave. Për mënyrën se si përpunohen të dhënat personale, ju lutemi lexoni Politikën e Privatësisë.",
        ],
      },
      {
        title: "13. Kufizimi i përgjegjësisë",
        paragraphs: [
          "DiversiHire ofrohet ‘siç është’ dhe ‘sipas disponueshmërisë’. Ne përpiqemi të ofrojmë një shërbim të sigurt dhe të dobishëm, por nuk garantojmë që platforma do të jetë gjithmonë pa gabime, e pandërprerë ose e përshtatshme për çdo nevojë individuale.",
          "Për aq sa lejohet nga ligji, DiversiHire nuk mban përgjegjësi për vendimet e punëdhënësve, aplikimet e refuzuara, mungesën e intervistave, gabimet në përmbajtjen e krijuar nga AI, humbjen e të dhënave ose dëme që vijnë nga përdorimi ose pamundësia e përdorimit të platformës.",
        ],
      },
      {
        title: "14. Pezullimi ose përfundimi i aksesit",
        paragraphs: [
          "Ne mund të pezullojmë, kufizojmë ose mbyllim aksesin tuaj nëse shkelni këto kushte, përdorni platformën në mënyrë të paligjshme, jepni informacion të rremë, abuzoni me shërbimin ose rrezikoni sigurinë dhe funksionimin e sistemit.",
        ],
      },
      {
        title: "15. Ndryshime në këto kushte",
        paragraphs: [
          "Ne mund t’i përditësojmë këto Kushte Përdorimi herë pas here. Kur bëjmë ndryshime, do të përditësojmë datën ‘Përditësuar së fundmi’ në krye të kësaj faqeje.",
          "Vazhdimi i përdorimit të DiversiHire pas ndryshimeve do të thotë se i pranoni kushtet e përditësuara.",
        ],
      },
      {
        title: "16. Ligji i zbatueshëm",
        paragraphs: [
          "Këto Kushte Përdorimi rregullohen nga ligjet e Republikës së Shqipërisë, përveç rasteve kur ligji i detyrueshëm parashikon ndryshe.",
          "Çdo mosmarrëveshje do të trajtohet sipas procedurave dhe juridiksionit të zbatueshëm në Republikën e Shqipërisë, përveç kur ligji kërkon një forum tjetër të detyrueshëm.",
        ],
      },
    ],
    contactTitle: "17. Kontakt",
    contactBody:
      "Për pyetje në lidhje me këto Kushte Përdorimi, mund të kontaktoni ekipin e DiversiHire.",
    contactEmail: "support@diversihire.com",
  },
  en: {
    eyebrow: "Legal",
    title: "Terms of Service",
    intro:
      "These Terms of Service set out the rules for using DiversiHire, including resume creation, cover letter generation, resume analysis, job recommendations, user profiles, payments, and other career-related services.",
    updated: "Last updated: May 2026",
    sections: [
      {
        title: "1. Acceptance of Terms",
        paragraphs: [
          "By accessing or using DiversiHire, you agree to follow these Terms of Service and our Privacy Policy.",
          "If you do not agree with these Terms, you should not use the platform.",
        ],
      },
      {
        title: "2. Description of the Service",
        paragraphs: [
          "DiversiHire is an online platform that provides tools for creating and editing resumes, generating cover letters, analyzing resumes, receiving AI-powered suggestions, and using other career-related services.",
          "We may change, improve, suspend, or remove certain features at any time where necessary for maintenance, security, service improvement, or legal reasons.",
        ],
      },
      {
        title: "3. User Accounts",
        paragraphs: [
          "Some features require an account. You are responsible for providing accurate information, keeping your password secure, and all activity that happens under your account.",
          "You should notify us if you believe your account has been used without authorization. We may suspend or limit your account if we identify unlawful use, violation of these Terms, or a risk to platform security.",
        ],
      },
      {
        title: "4. User Content",
        paragraphs: [
          "You are responsible for all data and materials you submit to the platform, including resumes, cover letters, profiles, applications, reviews, feedback, or company information.",
          "You agree not to submit content that is unlawful, misleading, abusive, discriminatory, violates third-party rights, or contains viruses, malware, or harmful code.",
          "Your personal resume and cover letter content remains your responsibility. DiversiHire uses this content only to provide the services you request, in accordance with our Privacy Policy.",
        ],
      },
      {
        title: "5. AI-Generated Suggestions",
        paragraphs: [
          "DiversiHire may provide AI-generated suggestions for resumes, cover letters, skills descriptions, job recommendations, and other professional content.",
          "These suggestions are provided for assistance only and do not constitute legal, financial, professional advice, or a guarantee of employment. You should review and edit any AI-generated content before using it.",
        ],
      },
      {
        title: "6. No Employment Guarantee",
        paragraphs: [
          "DiversiHire does not guarantee interviews, job offers, application acceptance, salary increases, specific career outcomes, or any particular decision by an employer.",
          "Hiring decisions are made by employers or third parties and are not controlled by DiversiHire.",
        ],
      },
      {
        title: "7. Payments and Subscriptions",
        paragraphs: [
          "Some features may be available through paid plans or subscriptions. Prices, billing periods, and included features are shown on the pricing page or during checkout.",
          "By purchasing a paid plan, you agree to pay the displayed fees and any applicable charges. Payments may be processed by third-party payment providers.",
          "If you use a recurring subscription, it may renew according to the terms shown at purchase unless cancelled according to the platform or payment provider instructions.",
        ],
      },
      {
        title: "8. Refunds",
        paragraphs: [
          "Refunds are provided only where required by applicable law, stated in the purchased plan, or provided under a published DiversiHire refund policy.",
          "To request a refund, contact support@diversihire.com and include the relevant payment or account information.",
        ],
      },
      {
        title: "9. Intellectual Property",
        paragraphs: [
          "The DiversiHire platform, name, logo, design, templates, features, text, visual elements, software, and other platform materials belong to DiversiHire or its licensors.",
          "You may not copy, sell, reproduce, distribute, modify, or use platform materials for commercial purposes without our written permission.",
        ],
      },
      {
        title: "10. Prohibited Use",
        paragraphs: [
          "You agree not to use DiversiHire for unlawful activity, fraud, spam, cyberattacks, mass copying or scraping, unauthorized access to systems or accounts, violating another person’s privacy, or actions that damage platform functionality.",
          "You also may not use the platform to generate or distribute false, discriminatory, abusive, threatening, or rights-infringing content.",
        ],
      },
      {
        title: "11. Third-Party Services and Links",
        paragraphs: [
          "The platform may include links or integrations with third-party services, such as payment providers, authentication services, job platforms, analytics tools, or other technical services.",
          "We are not responsible for the content, terms, privacy policies, or practices of third-party services. Your use of those services may be subject to their separate terms.",
        ],
      },
      {
        title: "12. Privacy and Data Protection",
        paragraphs: [
          "Personal data is processed according to our Privacy Policy and Albanian personal data protection law, including Law No. 124/2024 ‘On Personal Data Protection’.",
          "Using the platform does not replace your consent where the law requires separate consent for data processing. Please read our Privacy Policy for details on how personal data is processed.",
        ],
      },
      {
        title: "13. Limitation of Liability",
        paragraphs: [
          "DiversiHire is provided ‘as is’ and ‘as available’. We aim to provide a secure and useful service, but we do not guarantee that the platform will always be error-free, uninterrupted, or suitable for every individual need.",
          "To the extent permitted by law, DiversiHire is not responsible for employer decisions, rejected applications, lack of interviews, errors in AI-generated content, loss of data, or damages resulting from use or inability to use the platform.",
        ],
      },
      {
        title: "14. Suspension or Termination of Access",
        paragraphs: [
          "We may suspend, restrict, or terminate your access if you violate these Terms, use the platform unlawfully, provide false information, abuse the service, or endanger the security and operation of the system.",
        ],
      },
      {
        title: "15. Changes to These Terms",
        paragraphs: [
          "We may update these Terms of Service from time to time. When we make changes, we will update the ‘Last updated’ date at the top of this page.",
          "Continued use of DiversiHire after changes means you accept the updated Terms.",
        ],
      },
      {
        title: "16. Governing Law",
        paragraphs: [
          "These Terms of Service are governed by the laws of the Republic of Albania, unless mandatory law provides otherwise.",
          "Any dispute will be handled under the applicable procedures and jurisdiction of the Republic of Albania, unless the law requires a different mandatory forum.",
        ],
      },
    ],
    contactTitle: "17. Contact",
    contactBody:
      "For questions about these Terms of Service, you can contact the DiversiHire team.",
    contactEmail: "support@diversihire.com",
  },
};

function getSectionNumber(title: string) {
  return title.match(/^\d+/)?.[0] ?? "";
}

function getSectionTitle(title: string) {
  return title.replace(/^\d+\.\s*/, "");
}

export default function TermsOfServicePage() {
  const { language } = useLanguage();
  const current = content[language];

  return (
    <div className="min-h-screen bg-[#f7fbfc] text-gray-900">
      <PublicUserNav />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#d8eef1] bg-white p-7 shadow-sm sm:p-10 lg:p-12">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#088395]/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#35a9b5]/10 blur-3xl" />

          <div className="relative">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-[#e6f7f9] px-4 py-1.5 text-sm font-semibold text-[#088395]">
                {current.eyebrow}
              </span>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
                {current.title}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">
                {current.intro}
              </p>

              <p className="mt-5 text-sm font-medium text-gray-500">
                {current.updated}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {current.sections.map((section) => (
            <section
              key={section.title}
              className="group rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#088395]/30 hover:shadow-md sm:p-7"
            >
              <div className="mb-4 flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e6f7f9] text-sm font-bold text-[#088395]">
                  {getSectionNumber(section.title)}
                </span>
                <h2 className="pt-1 text-xl font-bold leading-snug text-gray-950">
                  {getSectionTitle(section.title)}
                </h2>
              </div>

              <div className="space-y-4 text-[15px] leading-7 text-gray-700">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              {section.list && (
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {section.list.map((item) => (
                    <li
                      key={item}
                      className="rounded-2xl bg-[#f4fbfc] px-4 py-3 text-sm font-medium text-gray-700"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <section className="mt-8 overflow-hidden rounded-[1.75rem] bg-[#088395] p-7 text-white shadow-sm sm:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              DiversiHire
            </p>
            <h2 className="mt-2 text-2xl font-bold">{current.contactTitle}</h2>
            <p className="mt-3 leading-7 text-white/90">
              {current.contactBody}
            </p>
            <a
              href={`mailto:${current.contactEmail}`}
              className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#088395] transition hover:bg-white/90"
            >
              {current.contactEmail}
            </a>
          </div>
        </section>
            </main>

      <Footer />
    </div>
  );
}