"use client";

import { useState } from "react";
import { PublicUserNav } from "@/src/components/figma/PublicUserNav";

type Language = "sq" | "en";

type PolicySection = {
  title: string;
  paragraphs: string[];
};

const privacyContent: Record<
  Language,
  {
    eyebrow: string;
    title: string;
    intro: string;
    lastUpdated: string;
    sections: PolicySection[];
    contactTitle: string;
    contactText: string;
    contactEmail: string;
  }
> = {
  sq: {
    eyebrow: "Ligjore",
    title: "Politika e Privatësisë",
    intro:
      "Kjo Politikë Privatësie shpjegon se si DiversiHire mbledh, përdor, ruan dhe mbron të dhënat personale të përdoruesve gjatë përdorimit të shërbimeve tona për CV, letra motivuese, analizim CV-je, përputhje me vende pune dhe mbështetje karriere.",
    lastUpdated: "Përditësuar së fundmi: Maj 2026",
    contactTitle: "16. Kontakt dhe ankesa",
    contactText:
      "Për pyetje, kërkesa ose ankesa në lidhje me këtë Politikë Privatësie ose të dhënat tuaja personale, mund të kontaktoni DiversiHire. Ju gjithashtu keni të drejtë të paraqisni ankesë pranë Komisionerit për të Drejtën e Informimit dhe Mbrojtjen e të Dhënave Personale në Shqipëri.",
    contactEmail: "support@diversihire.com",
    sections: [
      {
        title: "1. Kush jemi ne",
        paragraphs: [
          "DiversiHire është një platformë online që ndihmon përdoruesit të krijojnë CV, të gjenerojnë letra motivuese, të analizojnë aftësitë profesionale dhe të përdorin mjete të bazuara në inteligjencë artificiale për mbështetje në karrierë.",
          "Për qëllimet e kësaj Politike, DiversiHire vepron si kontrollues i të dhënave personale kur përcakton qëllimet dhe mënyrat e përpunimit të të dhënave tuaja. Kjo politikë është hartuar duke marrë parasysh Ligjin nr. 124/2024 ‘Për Mbrojtjen e të Dhënave Personale’, në fuqi në Shqipëri."
        ]
      },
      {
        title: "2. Fusha e zbatimit",
        paragraphs: [
          "Kjo politikë zbatohet për të dhënat personale që mbledhim, përpunojmë ose ruajmë kur përdorni faqen, krijoni llogari, krijoni CV ose letra motivuese, përdorni analizimin e CV-së, përdorni sugjerime të bazuara në AI, lini feedback ose ndërveproni me shërbimet tona.",
          "Kjo politikë nuk zbatohet për faqe, shërbime ose platforma të palëve të treta që mund të lidhen me DiversiHire dhe që kanë politikat e tyre të privatësisë."
        ]
      },
      {
        title: "3. Të dhënat që mbledhim",
        paragraphs: [
          "Kur përdorni DiversiHire, ne mund të mbledhim të dhëna që ju na jepni drejtpërdrejt, si emri, mbiemri, adresa e email-it, të dhënat e llogarisë, informacionet e profilit, të dhënat e CV-së, përmbajtja e letrave motivuese, aftësitë, arsimi, eksperienca e punës, projektet, certifikimet dhe informacione të tjera profesionale.",
          "Nëse përdorni funksione me pagesë, mund të përpunohen të dhëna faturimi ose pagese përmes ofruesve të jashtëm të pagesave. DiversiHire nuk synon të ruajë të dhëna të plota të kartës bankare në sistemet e veta.",
          "Ne mund të mbledhim gjithashtu të dhëna teknike si adresa IP, lloji i pajisjes, shfletuesi, sistemi operativ, aktiviteti në faqe dhe log-e sigurie."
        ]
      },
      {
        title: "4. Si i përdorim të dhënat tuaja",
        paragraphs: [
          "Ne i përdorim të dhënat tuaja për të krijuar dhe menaxhuar llogarinë tuaj, për të krijuar, ruajtur dhe përditësuar CV-të dhe letrat motivuese, për të analizuar CV-në tuaj, për të ofruar rekomandime pune dhe për të personalizuar eksperiencën tuaj në platformë.",
          "Ne mund t’i përdorim të dhënat gjithashtu për komunikime me ju, mbështetje teknike, përmirësim të funksioneve, siguri të platformës, përpunim pagesash, administrim të abonimeve dhe përmbushje të detyrimeve ligjore."
        ]
      },
      {
        title: "5. Baza ligjore e përpunimit",
        paragraphs: [
          "Ne përpunojmë të dhënat personale vetëm kur kemi një bazë të ligjshme, si pëlqimi juaj, përmbushja e një kontrate ose veprime para-kontraktore, detyrimet ligjore, interesi ynë i ligjshëm për funksionimin, sigurinë dhe përmirësimin e platformës, ose raste të tjera të lejuara nga ligji.",
          "Kur përpunimi bazohet në pëlqim, ju mund ta tërhiqni pëlqimin në çdo kohë, pa cenuar ligjshmërinë e përpunimit të kryer përpara tërheqjes."
        ]
      },
      {
        title: "6. Parimet e përpunimit",
        paragraphs: [
          "Ne synojmë që të dhënat personale të përpunohen në mënyrë të ligjshme, të drejtë dhe transparente; të mblidhen për qëllime të përcaktuara dhe legjitime; të jenë të kufizuara në atë që është e nevojshme; të jenë sa më të sakta dhe të përditësuara; të ruhen vetëm për aq kohë sa nevojitet; dhe të mbrohen me masa të përshtatshme sigurie.",
          "Ne gjithashtu synojmë të mbajmë përgjegjësi për mënyrën se si i përpunojmë të dhënat dhe të jemi në gjendje të demonstrojmë pajtueshmërinë kur kërkohet."
        ]
      },
      {
        title: "7. Të dhënat e CV-së dhe letrës motivuese",
        paragraphs: [
          "DiversiHire ju lejon të krijoni, redaktoni, ruani dhe menaxhoni CV dhe letra motivuese. Informacioni që vendosni në këto dokumente mund të përfshijë të dhëna personale dhe profesionale, si kontaktet, arsimi, historiku i punës, aftësitë, projektet dhe objektivat e karrierës.",
          "Ju jeni përgjegjës për saktësinë e informacionit që vendosni në dokumentet tuaja. Ne i ruajmë këto të dhëna në mënyrë që ju t’i shikoni, ndryshoni, shkarkoni ose ripërdorni më vonë."
        ]
      },
      {
        title: "8. Përdorimi i inteligjencës artificiale dhe profilizimi",
        paragraphs: [
          "DiversiHire mund të përdorë mjete të inteligjencës artificiale për të gjeneruar, analizuar ose përmirësuar CV, letra motivuese, përshkrime aftësish dhe rekomandime karriere. Këto funksione mund të analizojnë informacionin që jepni për të sugjeruar përmbajtje ose përputhje me pozicione pune.",
          "Përmbajtja e krijuar nga AI është vetëm sugjerim dhe nuk garanton punësim, intervistë, saktësi të plotë ose rezultat specifik profesional. Ju duhet ta kontrolloni dhe redaktoni çdo përmbajtje përpara përdorimit.",
          "DiversiHire nuk synon të marrë vendime plotësisht automatike që prodhojnë efekte ligjore ose ndikim të ngjashëm të rëndësishëm mbi ju pa mbikëqyrje njerëzore ose pa bazë ligjore të përshtatshme."
        ]
      },
      {
        title: "9. Reviews dhe feedback",
        paragraphs: [
          "Nëse zgjidhni të lini një review ose feedback, ne mund të shfaqim emrin, rolin/titullin, vlerësimin dhe tekstin e review-t në faqen tonë ose brenda platformës. Ju duhet të dërgoni vetëm informacion që jeni të gatshëm ta ndani publikisht.",
          "Nëse dëshironi që një review të hiqet ose ndryshohet, mund të na kontaktoni në emailin e kontaktit."
        ]
      },
      {
        title: "10. Ndarja e të dhënave me palë të treta",
        paragraphs: [
          "Ne nuk i shesim të dhënat tuaja personale. Ne mund të ndajmë të dhëna të kufizuara me ofrues të besuar shërbimesh vetëm kur është e nevojshme për funksionimin e platformës, si shërbime cloud, databaza, autentikim, pagesa, email, analitika ose përmbushje të kërkesave ligjore.",
          "Palët e treta që përpunojnë të dhëna në emrin tonë duhet të përdorin masa të përshtatshme sigurie dhe t’i përpunojnë të dhënat vetëm sipas udhëzimeve tona.",
          "Ne mund të zbulojmë të dhëna kur kjo kërkohet nga ligji, autoritetet kompetente, procedura gjyqësore ose për të mbrojtur të drejtat, sigurinë dhe funksionimin e platformës."
        ]
      },
      {
        title: "11. Transferimet ndërkombëtare",
        paragraphs: [
          "Disa ofrues shërbimesh mund të përpunojnë ose ruajnë të dhëna jashtë Shqipërisë. Kur ndodh një transferim ndërkombëtar, ne synojmë të përdorim mekanizma të lejuar nga ligji, si vendime përshtatshmërie, klauzola standarde kontraktuale, masa të përshtatshme mbrojtëse ose baza të tjera ligjore të zbatueshme.",
          "Nëse nuk përdorim transferime ndërkombëtare për një shërbim të caktuar, ky seksion mbetet i zbatueshëm vetëm për rastet kur një transferim i tillë bëhet i nevojshëm."
        ]
      },
      {
        title: "12. Siguria e të dhënave dhe njoftimi për shkelje",
        paragraphs: [
          "Ne marrim masa teknike dhe organizative për të mbrojtur të dhënat nga aksesi i paautorizuar, humbja, keqpërdorimi, ndryshimi i paautorizuar, publikimi i paligjshëm dhe sulmet kibernetike.",
          "Këto masa mund të përfshijnë kontroll aksesi, enkriptim, ruajtje të sigurt të fjalëkalimeve, backup, monitorim sigurie dhe kufizim të aksesit në të dhëna sensitive. Megjithatë, asnjë sistem online nuk mund të garantojë siguri absolute.",
          "Në rast shkeljeje të të dhënave personale, ne do të vlerësojmë rrezikun dhe do të veprojmë sipas kërkesave të ligjit të zbatueshëm, duke përfshirë njoftimin e autoritetit mbikëqyrës dhe/ose subjektit të të dhënave kur kërkohet."
        ]
      },
      {
        title: "13. Ruajtja e të dhënave",
        paragraphs: [
          "Ne i ruajmë të dhënat personale vetëm për aq kohë sa është e nevojshme për ofrimin e shërbimeve, menaxhimin e llogarisë, përmbushjen e detyrimeve ligjore, zgjidhjen e mosmarrëveshjeve, sigurinë dhe mirëmbajtjen e platformës.",
          "Ju mund të kërkoni fshirjen e llogarisë ose të të dhënave tuaja, përveç rasteve kur ruajtja kërkohet nga ligji ose është teknikisht e nevojshme për një periudhë të kufizuar."
        ]
      },
      {
        title: "14. Të drejtat tuaja",
        paragraphs: [
          "Sipas ligjit të zbatueshëm, ju mund të keni të drejtë të informoheni për përpunimin e të dhënave, të kërkoni akses, korrigjim, fshirje, kufizim të përpunimit, kundërshtim ndaj përpunimit, transferim të të dhënave dhe tërheqje të pëlqimit kur përpunimi bazohet në pëlqim.",
          "Ju gjithashtu mund të kundërshtoni përpunimin për marketing të drejtpërdrejtë në çdo kohë, nëse DiversiHire përdor të dhënat tuaja për këtë qëllim.",
          "Për të ushtruar të drejtat tuaja, mund të na kontaktoni në support@diversihire.com. Ne do t’i shqyrtojmë kërkesat sipas afateve dhe kushteve të parashikuara nga ligji."
        ]
      },
      {
        title: "15. Të miturit",
        paragraphs: [
          "Platforma jonë nuk synohet për përdorim nga fëmijë nën moshën 16 vjeç pa lejen e prindit ose kujdestarit ligjor. Nëse besoni se kemi mbledhur të dhëna nga një i mitur pa autorizim, ju lutemi na kontaktoni."
        ]
      }
    ]
  },
  en: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    intro:
      "This Privacy Policy explains how DiversiHire collects, uses, stores, and protects users’ personal data when using our resume, cover letter, resume analysis, job matching, and career support services.",
    lastUpdated: "Last updated: May 2026",
    contactTitle: "16. Contact and Complaints",
    contactText:
      "For questions, requests, or complaints about this Privacy Policy or your personal data, you can contact DiversiHire. You may also lodge a complaint with the Commissioner for the Right to Information and Personal Data Protection in Albania.",
    contactEmail: "support@diversihire.com",
    sections: [
      {
        title: "1. Who we are",
        paragraphs: [
          "DiversiHire is an online platform that helps users create resumes, generate cover letters, analyze professional skills, and use AI-powered tools for career support.",
          "For the purposes of this Policy, DiversiHire acts as a data controller when it determines the purposes and means of processing your personal data. This policy has been prepared with regard to Albanian Law No. 124/2024 ‘On Personal Data Protection’."
        ]
      },
      {
        title: "2. Scope of this policy",
        paragraphs: [
          "This policy applies to personal data we collect, process, or store when you use the website, create an account, create resumes or cover letters, use resume analysis, use AI-powered suggestions, leave feedback, or interact with our services.",
          "This policy does not apply to third-party websites, services, or platforms that may be linked from DiversiHire and that have their own privacy policies."
        ]
      },
      {
        title: "3. Personal data we collect",
        paragraphs: [
          "When you use DiversiHire, we may collect information you provide directly, such as your full name, email address, account details, profile information, resume data, cover letter content, skills, education, work experience, projects, certifications, and other professional information.",
          "If you use paid features, billing or payment-related data may be processed through external payment providers. DiversiHire does not intend to store full bank card details in its own systems.",
          "We may also collect technical information such as your IP address, device type, browser, operating system, website activity, and security logs."
        ]
      },
      {
        title: "4. How we use your data",
        paragraphs: [
          "We use your data to create and manage your account, create, save, and update resumes and cover letters, analyze your resume, provide job recommendations, and personalize your experience on the platform.",
          "We may also use your data for account communications, technical support, feature improvement, platform security, payment processing, subscription administration, and compliance with legal obligations."
        ]
      },
      {
        title: "5. Legal basis for processing",
        paragraphs: [
          "We process personal data only where we have a lawful basis, such as your consent, performance of a contract or pre-contractual steps, compliance with legal obligations, our legitimate interest in operating, securing, and improving the platform, or other grounds permitted by law.",
          "Where processing is based on consent, you may withdraw that consent at any time without affecting the lawfulness of processing carried out before withdrawal."
        ]
      },
      {
        title: "6. Processing principles",
        paragraphs: [
          "We aim to process personal data lawfully, fairly, and transparently; collect it for specified and legitimate purposes; limit it to what is necessary; keep it accurate and updated where possible; store it only for as long as needed; and protect it with appropriate security measures.",
          "We also aim to remain accountable for how we process personal data and to be able to demonstrate compliance where required."
        ]
      },
      {
        title: "7. Resume and cover letter data",
        paragraphs: [
          "DiversiHire allows users to create, edit, save, and manage resumes and cover letters. The information you enter into these documents may include personal and professional details such as contact information, education, work history, skills, projects, and career goals.",
          "You are responsible for ensuring that the information you provide is accurate. We store this data so that you can access, edit, download, and reuse your documents later."
        ]
      },
      {
        title: "8. Use of artificial intelligence and profiling",
        paragraphs: [
          "DiversiHire may use AI tools to generate, analyze, or improve resumes, cover letters, skills descriptions, and career recommendations. These features may analyze information you provide to suggest content or job matches.",
          "AI-generated content is provided as a suggestion only and does not guarantee employment, interviews, complete accuracy, or any specific professional outcome. You should review and edit all content before using it.",
          "DiversiHire does not intend to make decisions based solely on automated processing that produce legal effects or similarly significant effects concerning you without human oversight or an appropriate lawful basis."
        ]
      },
      {
        title: "9. Reviews and feedback",
        paragraphs: [
          "If you choose to leave a review or feedback, we may display your submitted name, role/title, rating, and review text on our website or inside the platform. You should only submit information that you are comfortable sharing publicly.",
          "If you want a review removed or changed, you can contact us using the contact email."
        ]
      },
      {
        title: "10. Sharing data with third parties",
        paragraphs: [
          "We do not sell your personal data. We may share limited data with trusted service providers only where necessary to operate the platform, such as cloud services, databases, authentication, payments, email, analytics, or legal compliance.",
          "Third parties processing data on our behalf must use appropriate security measures and process the data only according to our instructions.",
          "We may disclose data when required by law, competent authorities, court proceedings, or to protect the rights, security, and operation of the platform."
        ]
      },
      {
        title: "11. International transfers",
        paragraphs: [
          "Some service providers may process or store data outside Albania. Where an international transfer occurs, we aim to use mechanisms permitted by law, such as adequacy decisions, standard contractual clauses, appropriate safeguards, or other applicable legal grounds.",
          "If we do not use international transfers for a specific service, this section applies only where such a transfer becomes necessary."
        ]
      },
      {
        title: "12. Data security and breach notice",
        paragraphs: [
          "We take technical and organizational measures to protect personal data against unauthorized access, loss, misuse, unauthorized alteration, unlawful disclosure, and cyberattacks.",
          "These measures may include access controls, encryption, secure password storage, backups, security monitoring, and restricted access to sensitive data. However, no online system can guarantee absolute security.",
          "In the event of a personal data breach, we will assess the risk and act according to applicable law, including notifying the supervisory authority and/or affected data subjects where required."
        ]
      },
      {
        title: "13. Data retention",
        paragraphs: [
          "We keep personal data only for as long as necessary to provide services, manage your account, comply with legal obligations, resolve disputes, maintain security, and operate the platform.",
          "You may request deletion of your account or personal data, unless retention is required by law or technically necessary for a limited period."
        ]
      },
      {
        title: "14. Your rights",
        paragraphs: [
          "Under applicable law, you may have the right to be informed about data processing, request access, correction, deletion, restriction of processing, object to processing, request data portability, and withdraw consent where processing is based on consent.",
          "You may also object to processing for direct marketing at any time if DiversiHire uses your data for that purpose.",
          "To exercise your rights, you may contact us at support@diversihire.com. We will review requests according to the timelines and conditions required by law."
        ]
      },
      {
        title: "15. Minors",
        paragraphs: [
          "Our platform is not intended for children under 16 without permission from a parent or legal guardian. If you believe we have collected data from a minor without authorization, please contact us."
        ]
      }
    ]
  }
};

function getSectionNumber(title: string) {
  return title.match(/^\d+/)?.[0] ?? "";
}

function getSectionTitle(title: string) {
  return title.replace(/^\d+\.\s*/, "");
}

export default function PrivacyPolicyPage() {
  const [language, setLanguage] = useState<Language>("sq");
  const content = privacyContent[language];

  return (
    <div className="min-h-screen bg-[#f7fbfc] text-gray-900">
      <PublicUserNav />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#d8eef1] bg-white p-7 shadow-sm sm:p-10 lg:p-12">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#088395]/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#35a9b5]/10 blur-3xl" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-[#e6f7f9] px-4 py-1.5 text-sm font-semibold text-[#088395]">
                {content.eyebrow}
              </span>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
                {content.title}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">
                {content.intro}
              </p>

              <p className="mt-5 text-sm font-medium text-gray-500">
                {content.lastUpdated}
              </p>
            </div>

            <div className="inline-flex w-fit shrink-0 rounded-full border border-gray-200 bg-gray-50 p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setLanguage("sq")}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  language === "sq"
                    ? "bg-[#088395] text-white shadow"
                    : "text-gray-600 hover:text-gray-950"
                }`}
                aria-pressed={language === "sq"}
              >
                Shqip
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  language === "en"
                    ? "bg-[#088395] text-white shadow"
                    : "text-gray-600 hover:text-gray-950"
                }`}
                aria-pressed={language === "en"}
              >
                English
              </button>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {content.sections.map((section) => (
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
            </section>
          ))}
        </div>

        <section className="mt-8 overflow-hidden rounded-[1.75rem] bg-[#088395] p-7 text-white shadow-sm sm:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              DiversiHire
            </p>
            <h2 className="mt-2 text-2xl font-bold">{content.contactTitle}</h2>
            <p className="mt-3 leading-7 text-white/90">{content.contactText}</p>
            <a
              href={`mailto:${content.contactEmail}`}
              className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#088395] transition hover:bg-white/90"
            >
              {content.contactEmail}
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
