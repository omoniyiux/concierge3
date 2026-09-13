import type { DocBlock } from "@/lib/docs";

/**
 * The three documents the auth flow links to. They were linked from the signup
 * consent line and the auth footer long before they existed, so every one of
 * those links 404'd at the exact moment somebody was being asked to agree.
 *
 * Terms and Privacy are drafted from how the product actually behaves, but
 * they are not vetted copy — `reviewed: false` puts a visible notice on the
 * page so an unreviewed draft can never quietly read as counsel-approved.
 * Flip it once a lawyer has signed the text off.
 */
export type LegalDoc = {
  slug: string;
  title: string;
  summary: string;
  /** Shown as "Last updated". Bump it whenever the text below changes. */
  updated: string;
  reviewed: boolean;
  blocks: DocBlock[];
};

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "terms",
    title: "Terms of Service",
    summary:
      "The agreement between you and Concierge: what we provide, what you are responsible for, and how either of us can end it.",
    updated: "13 September 2026",
    reviewed: false,
    blocks: [
      { kind: "h", text: "The agreement" },
      {
        kind: "p",
        text: "These terms cover your use of Concierge — the workspace, the agent that runs on your website, Concierge Pages, and every API and integration we offer alongside them. Creating an account means you accept them. If you are accepting on behalf of a company, you confirm you are allowed to bind that company.",
      },
      { kind: "h", text: "Your account" },
      {
        kind: "list",
        items: [
          "You are responsible for everything done under your account, including by people you invite to it.",
          "Keep your credentials to yourself, and tell us promptly if you think they have been compromised.",
          "You must be old enough to enter a contract where you live.",
        ],
      },
      { kind: "h", text: "Websites you connect" },
      {
        kind: "p",
        text: "Concierge only learns from a website when you confirm you are authorised to connect it. You keep ownership of your website, your content and everything Concierge derives from it. You give us the licence we need to crawl the site, build a Site Brain, and run the agent on your behalf — and nothing more.",
      },
      {
        kind: "note",
        tone: "warning",
        title: "Connect only what is yours",
        body: "Pointing Concierge at a website you do not own or administer is a breach of these terms, and we will suspend an account that does it.",
      },
      { kind: "h", text: "What the agent says" },
      {
        kind: "p",
        text: "Concierge answers from knowledge you have approved. You decide what goes into the Site Brain, what stays out, and what the agent is allowed to do on your behalf. Because you control that material, you are responsible for the accuracy of what the agent tells your visitors, and for the commitments it makes for you — bookings, quotes and the rest.",
      },
      {
        kind: "p",
        text: "Language models are not deterministic. We work hard to keep the agent inside its approved knowledge, but we cannot warrant that every reply will be correct. Review the conversations surface, and use the restriction controls in the Site Brain for anything you cannot afford to have paraphrased.",
      },
      { kind: "h", text: "Acceptable use" },
      {
        kind: "list",
        items: [
          "Do not use Concierge to deceive people about whether they are talking to software.",
          "Do not use it to collect special-category personal data, or payment card details, through the agent.",
          "Do not attempt to extract the underlying models, or resell access to them as your own service.",
          "Do not use it for anything unlawful, or anything that would put our providers in breach of their terms.",
        ],
      },
      { kind: "h", text: "Fees" },
      {
        kind: "p",
        text: "Paid plans are billed in advance for the period you choose, and renew automatically until you cancel. Usage above your plan's allowance is billed in arrears at the rates shown on your plan. Fees are exclusive of tax. We will give you notice before a price change takes effect at your next renewal.",
      },
      { kind: "h", text: "Ending it" },
      {
        kind: "p",
        text: "You can cancel at any time from Settings, and the plan runs to the end of the period you have paid for. We can suspend or end an account that breaches these terms, and we will tell you why unless we are legally prevented from doing so. When an account ends you can export your conversations, leads and Site Brain for thirty days, after which we delete them.",
      },
      { kind: "h", text: "Liability" },
      {
        kind: "p",
        text: "Concierge is provided as it is. To the extent the law allows, neither of us is liable to the other for indirect or consequential loss, and our total liability in any twelve-month period is limited to what you paid us in that period. Nothing here limits liability that cannot lawfully be limited.",
      },
      { kind: "h", text: "Changes" },
      {
        kind: "p",
        text: "We will post any change here and update the date at the top. For a material change we will tell you inside the workspace before it takes effect. Continuing to use Concierge afterwards means you accept the revised terms.",
      },
      { kind: "h", text: "Getting in touch" },
      {
        kind: "p",
        text: "Questions about these terms go to legal@poweredbyconcierge.com, and we will come back to you.",
      },
    ],
  },

  {
    slug: "privacy",
    title: "Privacy Policy",
    summary:
      "What Concierge collects, why, how long we keep it, and the choices you and your website's visitors have.",
    updated: "13 September 2026",
    reviewed: false,
    blocks: [
      { kind: "h", text: "Two kinds of people" },
      {
        kind: "p",
        text: "This policy covers two groups, and the difference matters. You are our customer: you hold an account and we are the controller of your account data. Your website's visitors are your contacts: when Concierge handles a conversation on your site we process that conversation as your processor, on your instructions, and you remain the controller.",
      },
      { kind: "h", text: "What we collect about you" },
      {
        kind: "list",
        items: [
          "Account details — name, email address, and the organisation you belong to.",
          "Billing details — plan, invoices and payment status. Card details go to our payment processor, never to us.",
          "Product usage — which surfaces you open and which actions you take, so we can see what is working.",
          "Support correspondence, so we have the history when you come back.",
        ],
      },
      { kind: "h", text: "What we process for you" },
      {
        kind: "list",
        items: [
          "The public pages of the websites you connect, to build the Site Brain.",
          "Conversation transcripts between your visitors and the agent.",
          "Anything a visitor volunteers in a conversation — typically a name, an email address, a phone number, and what they wanted.",
          "Delivery records for routing, so a lead that failed to reach you can be replayed rather than lost.",
        ],
      },
      {
        kind: "note",
        tone: "info",
        title: "Tell your visitors too",
        body: "Because you are the controller of these conversations, your own privacy notice needs to cover them. The AI disclosure page has wording you are welcome to adapt.",
      },
      { kind: "h", text: "Why we are allowed to" },
      {
        kind: "p",
        text: "We process your account data to perform our contract with you, to meet legal obligations such as tax records, and on the basis of our legitimate interest in keeping the service secure and improving it. We process visitor data only on your documented instructions, as set out in our data processing agreement.",
      },
      { kind: "h", text: "Model training" },
      {
        kind: "p",
        text: "We do not train models on your Site Brain, your conversations or your leads, and our model providers are contractually barred from doing so with data we send them. Aggregate, de-identified statistics — how often answers fall outside approved knowledge, for instance — are used to improve the product.",
      },
      { kind: "h", text: "Who else sees it" },
      {
        kind: "p",
        text: "Sub-processors that make the product work: cloud hosting, the model providers behind the agent, our payment processor, and the destinations you yourself connect under Routing. We publish the current list and will give notice before adding to it. We do not sell personal data, and we have never done so.",
      },
      { kind: "h", text: "How long we keep it" },
      {
        kind: "list",
        items: [
          "Conversations and leads — for as long as your account is open, unless you set a shorter retention in Settings.",
          "Site Brain entries — until you delete them or disconnect the website.",
          "Account and billing records — for the life of the account, then as long as tax law requires.",
          "Deleted data is removed from backups within thirty days.",
        ],
      },
      { kind: "h", text: "Your rights" },
      {
        kind: "p",
        text: "Depending on where you live you can ask for a copy of your data, correct it, delete it, restrict how we use it, or object to it. Write to privacy@poweredbyconcierge.com and we will answer within a month. If a visitor makes that request to us, we will pass it to you, because it is your data to answer for.",
      },
      { kind: "h", text: "Where it lives" },
      {
        kind: "p",
        text: "Data is hosted in the region you pick when you create your organisation. Where we transfer it elsewhere, we rely on standard contractual clauses and the safeguards they require.",
      },
      { kind: "h", text: "Changes" },
      {
        kind: "p",
        text: "We will post any change here and update the date at the top, and tell you inside the workspace before a material change takes effect.",
      },
    ],
  },

  {
    slug: "ai-disclosure",
    title: "AI Disclosure",
    summary:
      "How the Concierge agent works, what it can and cannot do, and what we ask of you when you put it in front of your visitors.",
    updated: "13 September 2026",
    reviewed: true,
    blocks: [
      { kind: "h", text: "It is software, and it says so" },
      {
        kind: "p",
        text: "The Concierge agent is an AI assistant, not a person. It introduces itself as one at the start of every conversation, and it will say so again whenever a visitor asks. We do not offer a setting that turns that off, and presenting the agent as a human being is a breach of our terms.",
      },
      { kind: "h", text: "Where its answers come from" },
      {
        kind: "steps",
        items: [
          {
            title: "It reads your public pages",
            body: "When you connect a website, Concierge crawls the pages a visitor could already reach and proposes what it found as Site Brain entries.",
          },
          {
            title: "You approve what it may say",
            body: "Nothing proposed is usable until someone approves it. Until then the agent behaves as though it does not know it.",
          },
          {
            title: "It answers from approved knowledge only",
            body: "Replies are grounded in entries you have approved. Asked something outside them, the agent says it does not know and offers to put the visitor through, rather than guessing.",
          },
          {
            title: "It tells you what it could not answer",
            body: "Every unanswered question is logged to Insights, so the gaps in your Site Brain are visible instead of silent.",
          },
        ],
      },
      { kind: "h", text: "What it cannot do" },
      {
        kind: "list",
        items: [
          "It cannot invent a price, a policy or an availability that is not in approved knowledge.",
          "It cannot take payment card details, and it is instructed to refuse them if offered.",
          "It cannot complete an action you have not switched on and configured.",
          "It cannot stop a visitor asking for a person — that request always routes to you.",
        ],
      },
      {
        kind: "note",
        tone: "warning",
        title: "Grounding is not a guarantee",
        body: "Language models can still paraphrase badly or over-reach. For anything where exact wording matters — clinical, legal, regulated or safety information — mark the entry restricted so the agent quotes it rather than rewording it, and review the transcripts.",
      },
      { kind: "h", text: "Handing over to a person" },
      {
        kind: "p",
        text: "A visitor can ask for a human at any point, and the agent will hand off rather than keep trying. You can take over any live conversation yourself from the Conversations surface; when you do, the visitor is told that a person has joined.",
      },
      { kind: "h", text: "What we record" },
      {
        kind: "p",
        text: "Conversations are stored so you can read them, follow up on them and see what the agent got wrong. They belong to you, they are not used to train models, and your retention settings govern how long they last. Your own privacy notice should tell visitors that conversations with the agent are recorded.",
      },
      { kind: "h", text: "What we ask of you" },
      {
        kind: "list",
        items: [
          "Do not represent the agent as a human being, in the launcher or anywhere else.",
          "Keep approved knowledge current — an approved answer that has gone stale is worse than a gap.",
          "Cover agent conversations in your own privacy notice.",
          "Give visitors a route to a person, and answer it.",
        ],
      },
      { kind: "h", text: "Questions" },
      {
        kind: "p",
        text: "Anything about how the agent reaches an answer — including a specific reply you want explained — goes to ai@poweredbyconcierge.com.",
      },
    ],
  },
];

export const LEGAL_BY_SLUG = new Map(LEGAL_DOCS.map((d) => [d.slug, d]));
