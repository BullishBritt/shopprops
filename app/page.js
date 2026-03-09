"use client"
import { useState, useEffect, useRef, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════
// SHOPPROPS.COM — The Prop Firm Intelligence Platform
// Promo Code: BRITT | Accent: Cyan (#00e5ff)
// ═══════════════════════════════════════════════════════════════

const PROMO = "BRITT";
const CYAN = "#00e5ff";
const DARK = "#070b11";
const CARD = "#0c1119";
const BORDER = "#151d2b";
const MUTED = "#64748b";
const TEXT = "#cbd5e1";

// ── PROP FIRM DATA ──────────────────────────────────────────
const FIRMS = [
  { id:"topstep", name:"Topstep", logo:"📊", founded:2012, hq:"Chicago, IL", rating:4.6, eval:"1-Step", price50k:"$49/mo", profitTarget50k:"$3,000", maxLoss50k:"$2,000", drawdownType:"EOD Trailing", dailyLossLimit:"Yes ($1K-$3K)", profitSplit:"90/10", first10k:"100%", payoutSpeed:"1-3 days", payoutFreq:"Weekly", minPayoutDays:5, maxAccounts:5, platforms:"TopStepX, NinjaTrader, Tradovate", swingTrading:"No", newsTrading:"Yes", scalping:"Yes", consistency:"No", activationFee:"$149", maxAccount:"$150,000", payoutCap:"Uncapped", nfa:true, affiliate:"#", desc:"The original futures prop firm. NFA registered with 12+ years of history. Strong education ecosystem and structured evaluation.", pros:["NFA registered","12+ years operating","Strong education","Own brokerage"], cons:["Activation fee $149","No swing trading","Monthly subscription until funded"] },
  { id:"apex", name:"Apex Trader Funding", logo:"⚡", founded:2021, hq:"Austin, TX", rating:4.5, eval:"1-Step", price50k:"$35 (sale)", profitTarget50k:"$3,000", maxLoss50k:"$2,500 trailing", drawdownType:"Intraday Trailing", dailyLossLimit:"No", profitSplit:"90/10", first10k:"100% of first $25K", payoutSpeed:"10-13 biz days", payoutFreq:"Monthly (2x/mo after)", minPayoutDays:8, maxAccounts:20, platforms:"NinjaTrader, Tradovate, Rithmic, TradingView", swingTrading:"Yes", newsTrading:"Yes", scalping:"Yes", consistency:"No", activationFee:"$130-$160", maxAccount:"$300,000", payoutCap:"$70K per 8 days", nfa:false, affiliate:"#", desc:"Flexible rules with ability to run up to 20 accounts. Known for aggressive sales and 100% of first $25K in profits.", pros:["Up to 20 accounts","100% first $25K","No daily loss limit","Frequent sales"], cons:["Intraday trailing drawdown","Activation fee $130-$160","Slower payout processing"] },
  { id:"tradeify", name:"Tradeify", logo:"🚀", founded:2024, hq:"United States", rating:4.7, eval:"1-Step / Instant", price50k:"$103/mo (Select)", profitTarget50k:"$3,000", maxLoss50k:"$2,000", drawdownType:"EOD Trailing", dailyLossLimit:"Varies by plan", profitSplit:"90/10 (up to 100%)", first10k:"90/10", payoutSpeed:"Same day", payoutFreq:"Every 5 winning days (Flex)", minPayoutDays:5, maxAccounts:10, platforms:"NinjaTrader, Tradovate, TradingView", swingTrading:"Plan dependent", newsTrading:"Yes", scalping:"Yes", consistency:"Yes (during eval)", activationFee:"$0", maxAccount:"$250,000", payoutCap:"Varies", nfa:false, affiliate:"https://tradeify.co/?ref=britt", desc:"Flexible plans for instant funding or traditional evaluations. Zero activation fees make the total cost of funding among the lowest in the industry.", pros:["$0 activation fee","Same-day payouts","Multiple plan types","Lightning Funded option"], cons:["Newer firm (2024)","Consistency rule in eval","Lightning accounts can't reset"] },
  { id:"lucid", name:"Lucid Trading", logo:"💎", founded:2025, hq:"United States", rating:4.7, eval:"1-Step", price50k:"$99 (one-time)", profitTarget50k:"$3,000", maxLoss50k:"$2,000", drawdownType:"EOD Trailing", dailyLossLimit:"No (Flex) / Yes (Pro)", profitSplit:"90/10", first10k:"90/10", payoutSpeed:"~15 minutes", payoutFreq:"Every 5 days (Flex) / 3 days (Pro)", minPayoutDays:5, maxAccounts:10, platforms:"NinjaTrader, Tradovate, TradingView, Rithmic, Quantower", swingTrading:"Live phase only", newsTrading:"Yes", scalping:"Yes", consistency:"50% (eval only on Flex)", activationFee:"$0", maxAccount:"$200,000", payoutCap:"$1,500-$4,000/cycle", nfa:false, affiliate:"https://lucidtrading.com/ref/BullishBritt", desc:"Known for lightning-fast 15-minute payouts. Multiple account paths: LucidFlex (no daily loss limit), LucidPro (3-day payouts), LucidDirect (instant funding).", pros:["15-min payout processing","No daily loss limit (Flex)","One-time fee, no rebilling","Multiple account paths"], cons:["Newer firm (2025)","Payout caps per cycle","Swing only in live phase"] },
  { id:"mff", name:"My Funded Futures", logo:"🎯", founded:2023, hq:"United States", rating:4.5, eval:"1-Step", price50k:"$77 (one-time)", profitTarget50k:"$3,000", maxLoss50k:"$2,000", drawdownType:"EOD Trailing", dailyLossLimit:"No (eval) / Yes (funded)", profitSplit:"90/10", first10k:"100%", payoutSpeed:"~1 minute", payoutFreq:"After 5 profitable days", minPayoutDays:5, maxAccounts:5, platforms:"NinjaTrader, Tradovate, Rithmic", swingTrading:"No", newsTrading:"Yes", scalping:"Yes", consistency:"No", activationFee:"$0", maxAccount:"$150,000", payoutCap:"Uncapped", nfa:false, affiliate:"#", desc:"Straightforward rules with ultra-fast payout claims (~1 minute processing). No daily loss limit during evaluation. One-time payment model.", pros:["~1 min payout processing","100% first $10K","$0 activation fee","No DLL in eval"], cons:["Daily loss limit when funded","No swing trading","Smaller max account"] },
  { id:"takeprofittrader", name:"Take Profit Trader", logo:"📈", founded:2021, hq:"Orlando, FL", rating:4.3, eval:"1-Step", price50k:"$170", profitTarget50k:"$3,000", maxLoss50k:"$2,000", drawdownType:"Intraday Trailing (some EOD)", dailyLossLimit:"Yes", profitSplit:"80/20 → 90/10", first10k:"80/20", payoutSpeed:"Same day", payoutFreq:"Daily eligible", minPayoutDays:1, maxAccounts:5, platforms:"NinjaTrader, Tradovate, TradingView", swingTrading:"Yes", newsTrading:"Yes", scalping:"Yes", consistency:"No", activationFee:"$0", maxAccount:"$250,000", payoutCap:"Varies by progression", nfa:false, affiliate:"#", desc:"Path to live capital trading. Daily withdrawal eligibility from day one with no activation fees. Offers a route to trading real money.", pros:["Daily payouts from day 1","Path to live capital","No activation fee","Swing trading allowed"], cons:["Intraday trailing drawdown","80/20 initial split","Higher eval price"] },
  { id:"bulenox", name:"Bulenox", logo:"🟢", founded:2022, hq:"United States", rating:4.1, eval:"1-Step", price50k:"$175", profitTarget50k:"$3,000", maxLoss50k:"$2,500 trailing", drawdownType:"Intraday Trailing", dailyLossLimit:"Yes ($500-$1,250)", profitSplit:"90/10", first10k:"100% first $10K", payoutSpeed:"3-7 days", payoutFreq:"Weekly", minPayoutDays:5, maxAccounts:5, platforms:"NinjaTrader, Rithmic, Tradovate", swingTrading:"No", newsTrading:"Yes", scalping:"Yes", consistency:"No", activationFee:"$0-$130", maxAccount:"$250,000", payoutCap:"Progressive", nfa:false, affiliate:"https://bulenox.com/member/aff/go/bullishbritt", desc:"Budget-friendly option with weekly payouts. Stricter daily loss limits but no consistency rules. Multiple evaluation plans available.", pros:["Budget-friendly pricing","Weekly payouts","Multiple plan options","100% first $10K"], cons:["Strict daily loss limits","Intraday trailing drawdown","No overnight positions"] },
  { id:"fundednext", name:"FundedNext Futures", logo:"🌟", founded:2023, hq:"UAE / Global", rating:4.3, eval:"1-Step", price50k:"$149", profitTarget50k:"$3,000", maxLoss50k:"$2,000", drawdownType:"EOD Trailing", dailyLossLimit:"Yes", profitSplit:"80/20", first10k:"80/20", payoutSpeed:"24 hours guaranteed", payoutFreq:"After requirements met", minPayoutDays:5, maxAccounts:5, platforms:"NinjaTrader, Tradovate, Rithmic", swingTrading:"No", newsTrading:"Yes", scalping:"Yes", consistency:"40%", activationFee:"$0", maxAccount:"$200,000", payoutCap:"Progressive", nfa:false, affiliate:"#", desc:"Guarantees payouts within 24 hours or compensates traders $1,000. Strong brand presence with global operations.", pros:["24hr payout guarantee","$1K compensation if late","No activation fee","Strong brand"], cons:["80/20 profit split","40% consistency rule","Lower split than competitors"] },
  { id:"alphaF", name:"Alpha Futures", logo:"🏛️", founded:2023, hq:"United States", rating:4.6, eval:"Instant Funding", price50k:"Varies", profitTarget50k:"N/A (instant)", maxLoss50k:"$2,500", drawdownType:"EOD Trailing", dailyLossLimit:"No", profitSplit:"90/10", first10k:"90/10", payoutSpeed:"1-3 days", payoutFreq:"After 5 profitable days", minPayoutDays:5, maxAccounts:5, platforms:"NinjaTrader, Tradovate", swingTrading:"Plan dependent", newsTrading:"Yes", scalping:"Yes", consistency:"No", activationFee:"$0", maxAccount:"$250,000", payoutCap:"Progressive", nfa:false, affiliate:"https://app.alpha-futures.com/signup/Brittain001578/", desc:"Instant funding model with no evaluation required. Strong overall score for rule clarity and ecosystem. Multiple platform support.", pros:["Instant funding","No evaluation needed","No daily loss limit","Strong rule clarity"], cons:["Higher upfront cost","Newer firm","Limited to NinjaTrader/Tradovate"] },
  { id:"topone", name:"Top One Futures", logo:"🥇", founded:2023, hq:"United States", rating:4.4, eval:"1-Step", price50k:"$150", profitTarget50k:"$3,000", maxLoss50k:"$2,000", drawdownType:"EOD Trailing", dailyLossLimit:"Yes", profitSplit:"90/10", first10k:"90/10", payoutSpeed:"3-5 days", payoutFreq:"After requirements met", minPayoutDays:5, maxAccounts:5, platforms:"Tradovate, TradingView", swingTrading:"No", newsTrading:"Yes", scalping:"Yes", consistency:"No", activationFee:"$0", maxAccount:"$200,000", payoutCap:"Progressive", nfa:false, affiliate:"https://toponefutures.com/?linkId=lp_707970&sourceId=britt&tenantId=toponefutures", desc:"Solid mid-tier option with EOD drawdown and competitive pricing. Good for traders wanting straightforward rules.", pros:["EOD drawdown","No consistency rule","$0 activation fee","Competitive pricing"], cons:["Newer firm","Limited platform options","Progressive payout caps"] },
];

const BLOG_POSTS = [
  { id:"what-is-prop-firm", slug:"what-is-a-prop-firm", title:"What Is a Prop Firm? Complete Beginner's Guide", category:"Education", readTime:"8 min", date:"Mar 2026", excerpt:"Everything you need to know about proprietary trading firms — how they work, why they exist, and how you can trade with funded capital instead of risking your own money.", content:`Proprietary trading firms (prop firms) provide traders with capital to trade financial markets. Instead of risking your own money, you trade with the firm's capital and share the profits.\n\nThe modern prop firm model works through evaluations — simulated trading challenges where you prove your skills before getting access to funded capital. Think of it as an audition. You pay a one-time or monthly fee, trade a demo account following specific rules, and if you hit the profit target without breaking the rules, you "pass" and get a funded account.\n\nOnce funded, you trade the same way but now your profits are real. Most firms offer a 90/10 split — you keep 90% of what you make, and the firm keeps 10%. Some firms even give you 100% of your first $10,000-$25,000 in profits.\n\nThe key rules you'll encounter include profit targets (usually $3,000 for a 50K account), maximum loss limits ($2,000-$2,500), daily loss limits, and sometimes consistency rules that prevent you from making all your money on one lucky day.\n\nProp firms have exploded in popularity because they solve a real problem: talented traders who don't have enough capital. A $50K funded account that costs $50-$150 to attempt is dramatically cheaper than funding your own account with $50,000 of real money.` },
  { id:"how-payouts-work", slug:"how-prop-firm-payouts-work", title:"How Prop Firm Payouts Actually Work", category:"Education", readTime:"6 min", date:"Mar 2026", excerpt:"Demystifying the payout process — from requesting your first withdrawal to understanding profit splits, payout cycles, and what firms actually pay fastest.", content:`Getting paid from a prop firm involves several steps. After passing your evaluation and getting funded, you need to trade profitably and meet specific requirements before requesting a payout.\n\nMost firms require a minimum number of profitable trading days (usually 5) before your first withdrawal. Some firms like Take Profit Trader allow daily payouts from day one, while others like Lucid Trading's LucidPro tier only requires 3 days between payouts.\n\nPayout processing times vary dramatically. Lucid Trading processes withdrawals in approximately 15 minutes. My Funded Futures claims about 1-minute processing. Tradeify offers same-day payouts. On the slower end, Apex Trader Funding takes 10-13 business days.\n\nProfit splits typically start at 90/10 (you keep 90%) across most major firms. Some offer 100% of your first $10,000-$25,000 in profits. Apex gives you 100% of your first $25K, while Topstep and My Funded Futures offer 100% of your first $10K.\n\nMinimum payout amounts are usually $500. Payout methods include ACH (US bank transfer), cryptocurrency, and sometimes wire transfers. Always check which methods your firm supports before signing up.` },
  { id:"payout-splits", slug:"understanding-payout-splits", title:"Profit Splits Explained: Who Keeps What?", category:"Education", readTime:"5 min", date:"Mar 2026", excerpt:"Breaking down profit split structures across all major prop firms — from the initial bonus period to long-term split ratios.", content:`Profit splits determine how much of your trading profits you actually take home. Here's how the major firms structure their splits.\n\nThe standard in the industry is 90/10 — you keep 90% of profits, the firm takes 10%. This is what Topstep, Tradeify, Lucid Trading, My Funded Futures, and most others offer.\n\nSome firms offer a "first profit" bonus where you keep 100% of early earnings. Apex Trader Funding is the most generous here, giving traders 100% of their first $25,000. Topstep, My Funded Futures, and Bulenox offer 100% of the first $10,000.\n\nNotable exceptions: Take Profit Trader starts at 80/20 and progresses to 90/10 as you prove consistency. FundedNext Futures uses an 80/20 split throughout. Lucid Trading's live accounts drop to 80/20 from the 90/10 sim-funded split.\n\nWhen comparing splits, factor in the total cost of getting funded. A firm with a 90/10 split but $300 in total costs (eval + activation) is effectively worse than a firm with 90/10 and $100 total cost until you've made enough profit to offset the difference.` },
  { id:"drawdown-types", slug:"drawdown-types-explained", title:"EOD vs Intraday Trailing Drawdown: What's the Difference?", category:"Education", readTime:"7 min", date:"Mar 2026", excerpt:"The single most important rule difference between prop firms. Understanding drawdown types can make or break your funded account.", content:`Drawdown type is arguably the most important rule in prop firm trading. It determines when and how your maximum loss limit adjusts, and getting this wrong is the #1 reason traders fail.\n\nEnd-of-Day (EOD) Trailing Drawdown only updates at market close. If your account is up $1,000 intraday but closes flat, your drawdown hasn't changed. This gives you breathing room to manage trades through normal market volatility. Firms using EOD: Topstep, Tradeify, Lucid Trading, My Funded Futures, FundedNext.\n\nIntraday Trailing Drawdown updates in real-time based on your highest unrealized equity. If you're up $1,000 at 10 AM and the market reverses, you've effectively "lost" $1,000 of your drawdown cushion — even if you haven't closed the trade. Firms using intraday: Apex Trader Funding, Bulenox, Take Profit Trader.\n\nStatic Drawdown is the most trader-friendly — your maximum loss level never changes regardless of profits.\n\nFor beginners, EOD trailing drawdown is significantly easier to manage. Industry data suggests higher pass rates on EOD accounts compared to intraday trailing. If you're new to prop trading, prioritize firms offering EOD drawdown.` },
  { id:"best-beginners", slug:"best-prop-firms-for-beginners", title:"Best Prop Firms for Beginners in 2026", category:"Guide", readTime:"10 min", date:"Mar 2026", excerpt:"If you're new to prop trading, these are the firms with the most forgiving rules, best education, and highest probability of success.", content:`Starting your prop firm journey? The right firm can mean the difference between learning and growing vs. burning through evaluations.\n\nFor beginners, we recommend prioritizing: EOD drawdown (more forgiving), no daily loss limit during evaluation, one-time fees (not monthly), $0 activation fees, and strong educational resources.\n\nOur top picks for beginners:\n\n1. Tradeify SELECT (Flex) — EOD drawdown, structured consistency rule that teaches good habits, $0 activation fee, same-day payouts. The consistency rule during evaluation actually helps beginners develop better trading discipline.\n\n2. Topstep — The most robust education ecosystem in the industry. Webinars, coaching, community support. EOD drawdown, no consistency rule. The monthly fee model isn't ideal, but the education is worth it.\n\n3. My Funded Futures — Lowest entry cost ($77 for 50K), no daily loss limit during evaluation, EOD drawdown. Simple rules. Best for self-directed learners.\n\n4. Lucid Trading LucidFlex — No daily loss limit, no funded consistency rule, EOD drawdown. One-time fee. Very forgiving for beginners still finding their rhythm.\n\nAvoid starting with firms that use intraday trailing drawdown (Apex, Bulenox). These are better suited for experienced traders who already have a proven strategy.` },
  { id:"activation-fees", slug:"prop-firm-activation-fees", title:"The Hidden Cost: Activation Fees Explained", category:"Education", readTime:"5 min", date:"Mar 2026", excerpt:"Some firms advertise low evaluation prices but charge $130-$160 to activate your funded account. Here's the real cost breakdown.", content:`Activation fees are one-time charges you pay after passing an evaluation, before you can start trading your funded account. They're the hidden cost that makes "$35 evaluations" not quite as cheap as they appear.\n\nFirms with activation fees: Topstep ($149), Apex Trader Funding ($130-$160).\n\nFirms with NO activation fees: Tradeify ($0), Lucid Trading ($0), My Funded Futures ($0) ($0), Take Profit Trader ($0), Bulenox (varies), FundedNext ($0).\n\nThis matters more than you think. When you compare the total cost of getting funded on a 50K account: Apex might advertise $35 for the evaluation, but add the $160 activation and you're at $195. Tradeify charges $103/month for the evaluation with $0 activation. My Funded Futures charges $77 total.\n\nThe industry trend is clearly moving away from activation fees. Newer firms have recognized that high pass-fees drive traders away and create distrust. If you're comparing firms, always calculate the Total Cost of Funding (TCF): evaluation fee + activation fee + any reset costs.` },
  { id:"compare-apex-topstep", slug:"apex-vs-topstep", title:"Apex vs Topstep: Head-to-Head Comparison", category:"Comparison", readTime:"8 min", date:"Mar 2026", excerpt:"The two biggest names in futures prop trading go head to head. Which one is right for your trading style?", content:`Apex Trader Funding and Topstep are the two most recognized names in futures prop trading, but they serve very different trader profiles.\n\nTopstep is the veteran — NFA registered, operating since 2012, with a strong education ecosystem. They use EOD trailing drawdown, charge $49/month for a 50K evaluation, and have a $149 activation fee. Profit split is 90/10 with 100% on first $10K.\n\nApex is the flexible option — no daily loss limit, up to 20 accounts simultaneously, 100% of first $25K in profits. They use intraday trailing drawdown, often run sales at $35 for evaluations, but charge $130-$160 for activation.\n\nChoose Topstep if: you're a beginner who values education, you want NFA regulation, you prefer EOD drawdown, and you don't mind the monthly fee model.\n\nChoose Apex if: you're experienced, want to run multiple accounts, can handle intraday trailing drawdown, and want to keep 100% of your first $25K.\n\nThe total cost comparison is closer than it appears. Topstep: $49/month + $149 activation. Apex: $35 eval + $160 activation = $195 total. If you pass Topstep in month one, it's $198 total. Nearly identical.\n\nThe real differentiator is drawdown type. EOD (Topstep) is more forgiving. Intraday trailing (Apex) is harder to manage but Apex compensates with no daily loss limit.` },
  { id:"compare-tradeify-mff", slug:"tradeify-vs-my-funded-futures", title:"Tradeify vs My Funded Futures: Which Is Better Value?", category:"Comparison", readTime:"7 min", date:"Mar 2026", excerpt:"Two of the most cost-effective prop firms compared. Both offer $0 activation — but the similarities end there.", content:`Tradeify and My Funded Futures (MFF) both target cost-conscious traders with $0 activation fees and competitive pricing. Here's how they stack up.\n\nTradeify SELECT costs $103/month with a consistency rule during evaluation. MFF costs $77 one-time payment with no consistency rule. On price alone, MFF wins for traders who pass quickly. If you take 2+ months on Tradeify, the cost adds up.\n\nHowever, Tradeify offers something MFF doesn't: instant funding options. The Lightning Funded account lets you skip the evaluation entirely for a one-time fee. For experienced traders who know they can be profitable, this saves time.\n\nPayout speed: Tradeify processes same-day. MFF claims approximately 1 minute. Both are among the fastest in the industry.\n\nDrawdown: Both use EOD trailing. Both offer $2,000 max loss on 50K accounts. Nearly identical rule sets here.\n\nDaily loss limit: MFF has no daily loss limit during evaluation (huge advantage for beginners). Tradeify varies by plan.\n\nOur verdict: MFF is better for budget-conscious beginners. Tradeify is better for experienced traders who want multiple pathways to funding and faster scaling.` },
  { id:"fastest-payouts", slug:"fastest-payout-prop-firms", title:"Fastest Payout Prop Firms Ranked", category:"Guide", readTime:"6 min", date:"Mar 2026", excerpt:"Ranked by actual payout processing speed — from 15 minutes to 2 weeks. Speed matters when you need your money.", content:`Payout speed varies dramatically across prop firms. Here's the definitive ranking based on reported processing times.\n\n1. Lucid Trading — ~15 minutes. Verified by traders in live tests. The fastest in the industry by a significant margin. US ACH same-day.\n\n2. My Funded Futures — ~1 minute claimed. The fastest advertised speed. Actual receipt of funds depends on your bank.\n\n3. Tradeify — Same day. Some traders report funds in 10 minutes. Consistently fast.\n\n4. Take Profit Trader — Same day. Daily withdrawal eligibility from day one.\n\n\n\n6. Topstep — 1-3 days. Reliable and consistent.\n\n7. FundedNext — 24 hours guaranteed ($1,000 compensation if late).\n\n\n\n9. Bulenox — 3-7 business days.\n\n10. Apex Trader Funding — 10-13 business days. The slowest major firm by far.\n\nIf payout speed is your top priority, Lucid Trading, MFF, and Tradeify are the clear winners. If you can handle waiting, Apex's other benefits (20 accounts, 100% of first $25K) might outweigh the slower processing.` },
  { id:"avoid-mistakes", slug:"prop-firm-mistakes-to-avoid", title:"10 Mistakes That Will Blow Your Prop Firm Account", category:"Education", readTime:"7 min", date:"Mar 2026", excerpt:"Learn from other traders' failures. These are the most common reasons traders breach their accounts — and how to avoid them.", content:`90% of traders fail their prop firm evaluations. Here are the most common mistakes and how to avoid them.\n\n1. Not understanding your drawdown type. If you're on an intraday trailing drawdown account, unrealized gains that reverse count against you. Many traders breach without ever closing a losing trade.\n\n2. Overtrading. Taking 15+ trades per day dramatically increases your chance of breaching. Quality over quantity.\n\n3. Ignoring the daily loss limit. On firms with a DLL, one bad morning can lock you out for the day — or breach your account entirely.\n\n4. Trading too large. Just because you have a 50K account doesn't mean you should trade 5 contracts. Start with 1-2 and scale up.\n\n5. Revenge trading. Your worst loss doesn't define you, but the revenge trade after it might end your account.\n\n6. Not reading the rules. Every firm has specific rules about trading hours, position limits, and news events. Read them.\n\n7. Trying to hit the profit target in one day. This violates consistency rules and also puts you at maximum risk. Spread it out.\n\n8. Trading during major news without preparation. FOMC, NFP, and CPI releases create massive volatility that can breach accounts in seconds.\n\n9. Ignoring market hours. All positions must close by market close (usually 4:45 PM EST). Auto-liquidation isn't fun.\n\n10. Choosing the wrong firm. If you're a beginner on an intraday trailing drawdown account, you're setting yourself up to fail. Match the firm to your skill level.` },
  { id:"prop-tax", slug:"prop-firm-taxes", title:"How to Handle Taxes on Prop Firm Profits", category:"Education", readTime:"8 min", date:"Mar 2026", excerpt:"Yes, prop firm profits are taxable. Here's what you need to know about reporting, deductions, and structuring your trading as a business.", content:`Prop firm profits are taxable income, and how you handle taxes can significantly impact your take-home pay.\n\nMost prop firm payouts are reported as independent contractor income (1099 or equivalent). This means you're responsible for self-employment tax (15.3%) on top of your regular income tax rate.\n\nHowever, there are strategies to reduce your tax burden. If you trade frequently enough to qualify for Trader Tax Status (TTS), you can deduct trading-related expenses: platform subscriptions, data feeds, VPS services, evaluation fees, and even a home office.\n\nStructuring your trading through an S-Corp or LLC can save on self-employment taxes. Instead of paying SE tax on all profits, you pay yourself a reasonable salary and take the remainder as distributions.\n\nKey deductions for prop firm traders: evaluation fees, reset fees, platform fees, market data subscriptions, trading education, VPS/computer equipment, home office, and internet costs.\n\nImportant: Keep detailed records of all evaluation purchases, payout receipts, and trading expenses. Consider working with a CPA who specializes in trader taxation.\n\nNote: Use code BRITT for discounts on tax preparation services designed specifically for prop firm traders.` },
  { id:"scaling-plans", slug:"prop-firm-scaling-plans", title:"Scaling Plans: How to Grow Your Funded Account", category:"Education", readTime:"6 min", date:"Mar 2026", excerpt:"Most prop firms offer scaling plans that increase your buying power and payout limits as you prove consistency. Here's how they work.", content:`Scaling plans reward consistent profitability by increasing your account size, contract limits, and payout caps over time.\n\nHow scaling typically works: After meeting specific milestones (usually a combination of profitable days and total profit), your account "scales up" — allowing you to trade more contracts and withdraw larger amounts.\n\nTopstep has one of the most structured scaling plans, incrementally increasing contract limits based on your account balance. Apex allows up to 20 accounts from the start, which is a different approach to scaling — you scale horizontally rather than vertically.\n\nLucid Trading's LucidMaxx tier (invite-only) offers daily payouts with no caps — the ultimate scaled account. You need to earn it through consistent performance on lower tiers.\n\n\n\nThe key to scaling: consistency over time. Firms reward steady daily profits more than occasional big wins. A trader making $200/day for 20 days is more valuable to a firm than one making $4,000 in a single session.` },
  { id:"platforms-guide", slug:"trading-platforms-for-prop-firms", title:"Trading Platforms Guide: NinjaTrader vs Tradovate vs Rithmic", category:"Education", readTime:"7 min", date:"Mar 2026", excerpt:"Which trading platform should you use for prop firm trading? Here's the complete breakdown of compatibility, features, and costs.", content:`Your choice of trading platform affects your experience, costs, and which prop firms you can trade with.\n\nNinjaTrader is the most widely supported platform across prop firms. It offers advanced charting, custom indicators, and automated strategy capabilities. Most firms support NinjaTrader through either Tradovate or Rithmic data connections. Free to use for sim trading; license required for live.\n\nTradovate is a web-based platform that works on any device. It's the most accessible option — no downloads required, works on Mac and iOS natively. Simpler than NinjaTrader but covers all essential features. Supported by Topstep, Apex, Tradeify, Lucid, MFF, and others.\n\nRithmic is the data provider favored by many professional traders for its speed and reliability. It's not a platform itself but connects to platforms like NinjaTrader, Quantower, and Sierra Chart. Known for the fastest market data and order execution.\n\nTradingView integration is growing — Tradeify, Lucid, and Take Profit Trader now support it. Great for traders who already use TradingView for charting.\n\nTopStepX is Topstep's proprietary platform, designed specifically for their evaluation and funded trading. Web-based, simple, and optimized for the Topstep experience.\n\nFor beginners: start with Tradovate (web-based, easy to learn). For advanced traders: NinjaTrader with Rithmic data gives you the most control and fastest execution.` },
  { id:"news-trading", slug:"news-trading-prop-firms", title:"Can You Trade News on a Prop Firm Account?", category:"Education", readTime:"5 min", date:"Mar 2026", excerpt:"Most prop firms allow news trading, but the rules vary. Here's what you can and can't do during major economic releases.", content:`News trading — trading around major economic releases like FOMC, NFP, and CPI — is allowed by most prop firms, but with important caveats.\n\nFirms that allow news trading: Topstep, Apex, Tradeify, Lucid, MFF, Take Profit Trader, Bulenox, and most others.\n\nHowever, "allowed" doesn't mean "recommended." Major news events create extreme volatility that can breach accounts in seconds, especially on accounts with intraday trailing drawdown. A 50-point NQ spike can wipe out your entire drawdown cushion before you can react.\n\nBest practices for news trading on prop accounts: reduce position size significantly (1 micro instead of 1 mini), widen your stop losses, be flat before the release and enter after the initial spike settles, and never risk more than 25% of your available drawdown on a news trade.\n\nSome firms have specific restrictions: certain platforms may widen spreads or reduce leverage during high-impact news. Always check your firm's specific policies.\n\nIf you're on an EOD drawdown account, news trading is more manageable because intraday spikes don't count against you if the market recovers by close.` },
  { id:"consistency-rules", slug:"consistency-rules-explained", title:"Consistency Rules: The Rule That Trips Up Most Traders", category:"Education", readTime:"6 min", date:"Mar 2026", excerpt:"Some prop firms require that no single day accounts for more than 30-50% of your total profit. Here's how to navigate consistency rules.", content:`Consistency rules prevent you from hitting your profit target with one or two massive winning days. They exist to ensure you can trade profitably over multiple sessions, not just get lucky.\n\nHow it works: if your profit target is $3,000 and the consistency rule is 50%, no single day can account for more than $1,500 of your total profit. If you make $2,000 on day one, you've technically "passed" if you make $1,000 more — but your $2,000 day exceeds 50% of $3,000, so you need to keep trading until that day represents less than 50% of your total.\n\nFirms with consistency rules: Tradeify (50% during eval), Lucid LucidFlex (50% during eval, none when funded), FundedNext (40%), Lucid LucidPro (varies).\n\nFirms WITHOUT consistency rules: Topstep, Apex, My Funded Futures, Take Profit Trader, Bulenox.\n\nStrategy for passing with a consistency rule: aim for roughly equal daily profits. If your target is $3,000 with 50% consistency, target $500-$600 per day for 5-6 days. This natural approach builds good habits and increases your survival rate when funded.\n\nConsistency rules are controversial. Critics say they penalize exceptional trading days. Supporters argue they filter out gambling behavior. Either way, knowing whether your firm has one is essential before you start.` },
  { id:"account-stacking", slug:"account-stacking-strategy", title:"Account Stacking: Running Multiple Prop Firm Accounts", category:"Strategy", readTime:"6 min", date:"Mar 2026", excerpt:"Advanced traders run multiple funded accounts simultaneously to multiply their income. Here's how account stacking works and which firms support it.", content:`Account stacking — running multiple funded accounts at the same time — is one of the most powerful strategies for maximizing prop firm income.\n\nThe concept is simple: if you can consistently profit on one 50K account, running 5 or 10 accounts with the same strategy multiplies your income proportionally.\n\nApex Trader Funding leads here, allowing up to 20 simultaneous accounts. At 20 accounts, a $500 daily profit per account becomes $10,000/day. This is why Apex is popular among experienced traders despite its slower payouts.\n\nOther firms' account limits: Topstep (5 accounts), Tradeify (10), Lucid (10), MFF (5) (5).\n\nImportant rules: Most firms prohibit fully automated "set and forget" bots on funded accounts. Apex specifically allows semi-automated execution tools but bans fully automated trading. You need to manually initiate or confirm trades.\n\nTrade copiers like CrossTrade allow you to place a trade on one platform and have it automatically replicate across multiple accounts. This is the standard approach for account stacking.\n\nCosts add up: 10 Apex accounts at $35 each = $350 for evaluations, plus 10 × $160 activation = $1,600 total. But if each account generates $5,000/month in profits, the ROI is extraordinary.` },
  { id:"sim-vs-live", slug:"sim-funded-vs-live-funded", title:"Sim Funded vs Live Funded: What's the Difference?", category:"Education", readTime:"5 min", date:"Mar 2026", excerpt:"Most prop firm 'funded' accounts are actually simulated. Here's the truth about where your trades actually go.", content:`Here's something most prop firm marketers don't tell you: the majority of "funded" accounts are still simulated. Your trades aren't hitting the real market.\n\nSim-funded accounts execute trades in a simulated environment that mirrors real market conditions. The firm pays you from their revenue (primarily from evaluation fees paid by other traders). Your P&L is real money, but your trades aren't.\n\nLive-funded accounts execute real trades on real exchanges through a broker. Your orders actually move the market (slightly). Only a few firms offer this: Topstep (through TopStep Brokerage LLC) and Take Profit Trader.\n\nDoes it matter? For most traders, no. Your P&L is the same whether your trades are simulated or live. The execution quality is generally identical for retail-sized orders.\n\nWhere it matters: if a sim-funded firm goes bankrupt, your account and pending payouts could be at risk. Live-funded accounts through regulated brokers offer more protection. This is why Topstep's NFA registration and own brokerage is significant.\n\nThe industry is slowly moving toward more live capital access. Topstep has its own brokerage. Take Profit Trader routes to live accounts as you scale. Expect more firms to follow this trend.` },
  { id:"choosing-account-size", slug:"how-to-choose-account-size", title:"50K vs 100K vs 150K: Which Account Size Should You Choose?", category:"Guide", readTime:"5 min", date:"Mar 2026", excerpt:"Bigger isn't always better. Here's how to choose the right account size based on your experience, strategy, and risk tolerance.", content:`Account size affects your profit target, drawdown cushion, contract limits, and evaluation cost. Choosing wrong can set you up for failure.\n\nThe 50K account is the sweet spot for most traders. The profit target ($3,000) is achievable without excessive risk, the drawdown ($2,000) gives enough room to survive normal market volatility, and the evaluation cost is the lowest.\n\n100K accounts double everything: $6,000 profit target, $3,000-$4,000 drawdown, and typically 2x the evaluation cost. Choose this if you're comfortable trading 2-4 contracts and your strategy naturally produces larger daily P&L swings.\n\n150K accounts are for experienced traders only. $9,000 profit targets require sustained profitability over multiple sessions. The higher drawdown gives more room, but the profit target is proportionally harder to reach.\n\nOur recommendation for different experience levels: Beginners → 50K (lower cost, achievable targets). Intermediate → 50K or 100K (depends on strategy). Advanced → 100K or 150K, or multiple 50K accounts (account stacking).\n\nPro tip: it's often better to pass multiple 50K evaluations than one 150K. The profit targets are easier, the cost per attempt is lower, and you can stack accounts for more total capital.` },
  { id:"prop-vs-personal", slug:"prop-firm-vs-personal-account", title:"Prop Firm vs Personal Account: Which Is Right for You?", category:"Education", readTime:"6 min", date:"Mar 2026", excerpt:"Should you trade with a prop firm or fund your own account? The math might surprise you.", content:`The fundamental question: should you pay for a prop firm evaluation or just fund your own account? Let's do the math.\n\nTo replicate a 50K prop firm account with your own capital, you'd need $50,000. That's real money at risk. A prop firm evaluation costs $50-$170. Even if you fail 10 evaluations, you've spent $500-$1,700 — still 97% less than funding yourself.\n\nProp firm advantages: minimal capital at risk, professional-grade platforms and data, forced discipline through rules, ability to scale through multiple accounts, and no personal financial devastation if things go wrong.\n\nPersonal account advantages: you keep 100% of profits (no split), no rules restricting your strategy, no evaluation to pass, trade any instrument/timeframe, and no firm-specific restrictions.\n\nThe hybrid approach many successful traders use: trade prop firm accounts for income while building a personal account with saved profits. As your personal account grows, you gain freedom. As your prop accounts generate income, you have cash flow.\n\nBreak-even analysis: on a prop firm with 90/10 split, you keep 90%. To replicate 50K in buying power yourself, you'd need $50,000 earning 100% of profits. You'd need to make $5,556 in profits on your personal account to match $5,000 × 90% = $4,500 from the prop firm. But you'd need $50,000 at risk vs $100 for the evaluation.\n\nFor most traders, especially early in their career, prop firms offer dramatically better risk-adjusted returns.` },
];

// ── FIRM LOGO SVG COMPONENT ──────────────────────────────────
const FirmLogo = ({ id, size = 36 }) => {
  const s = size;
  const logos = {
    topstep: (
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#1a2332"/>
        <path d="M10 28L15 20L20 23L25 15L30 10" stroke="#00c878" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M26 10H30V14" stroke="#00c878" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="9" y="31" width="22" height="1.5" rx="0.75" fill="#00c878" opacity="0.25"/>
      </svg>
    ),
    apex: (
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#141414"/>
        <path d="M20 7L33 33H7L20 7Z" fill="#f5a623" opacity="0.12"/>
        <path d="M20 7L33 33H7L20 7Z" stroke="#f5a623" strokeWidth="2.2" fill="none"/>
        <path d="M15 26H25" stroke="#f5a623" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M17.5 21H22.5" stroke="#f5a623" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      </svg>
    ),
    tradeify: (
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#0e1225"/>
        <rect x="10" y="8" width="6" height="24" rx="3" fill="#7c3aed" opacity="0.8"/>
        <rect x="21" y="15" width="6" height="17" rx="3" fill="#7c3aed" opacity="0.55"/>
        <path d="M13 6L13 8" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="30" cy="12" r="3" fill="#a78bfa" opacity="0.7"/>
        <path d="M27 12L33 12" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M30 9L30 15" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    lucid: (
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#060e18"/>
        <path d="M20 5L34 20L20 35L6 20L20 5Z" stroke="#00d4ff" strokeWidth="2" fill="none"/>
        <path d="M20 11L28 20L20 29L12 20L20 11Z" fill="#00d4ff" opacity="0.12"/>
        <path d="M20 15L24 20L20 25L16 20L20 15Z" fill="#00d4ff" opacity="0.3"/>
        <circle cx="20" cy="20" r="2.5" fill="#00d4ff"/>
      </svg>
    ),
    mff: (
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#0c1424"/>
        <circle cx="20" cy="20" r="13" stroke="#06b6d4" strokeWidth="2" fill="none"/>
        <circle cx="20" cy="20" r="8" stroke="#06b6d4" strokeWidth="1.5" opacity="0.45" fill="none"/>
        <circle cx="20" cy="20" r="3.5" fill="#06b6d4"/>
        <path d="M20 7V11" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M20 29V33" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 20H11" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M29 20H33" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    takeprofittrader: (
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#0a1a0d"/>
        <path d="M9 30L16 21L22 25L31 11" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M25 11H31V17" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="22" cy="25" r="2" fill="#22c55e" opacity="0.35"/>
        <circle cx="16" cy="21" r="2" fill="#22c55e" opacity="0.35"/>
      </svg>
    ),
    bulenox: (
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#081208"/>
        <circle cx="20" cy="18" r="10" stroke="#4ade80" strokeWidth="2" fill="none"/>
        <path d="M16 22C16 22 16 15 20 12C24 15 24 22 24 22" fill="#4ade80" opacity="0.2" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="20" cy="10" r="2" fill="#4ade80" opacity="0.6"/>
        <rect x="10" y="30" width="20" height="2" rx="1" fill="#4ade80" opacity="0.3"/>
      </svg>
    ),
    fundednext: (
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#120828"/>
        <path d="M20 7L23.5 16H32L25.2 21.5L27.8 31L20 25.5L12.2 31L14.8 21.5L8 16H16.5L20 7Z" stroke="#a855f7" strokeWidth="2" fill="none"/>
        <path d="M20 12L22.5 18H28L23.5 22L25.5 28.5L20 24.5L14.5 28.5L16.5 22L12 18H17.5L20 12Z" fill="#a855f7" opacity="0.15"/>
        <circle cx="20" cy="19.5" r="3" fill="#a855f7" opacity="0.5"/>
      </svg>
    ),
    alphaF: (
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#0a1628"/>
        <path d="M10 33L20 7L30 33" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M14 25H26" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="20" cy="14" r="2" fill="#60a5fa" opacity="0.5"/>
      </svg>
    ),
    topone: (
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#1a1600"/>
        <circle cx="20" cy="20" r="14" stroke="#eab308" strokeWidth="2" fill="none"/>
        <circle cx="20" cy="20" r="10" stroke="#eab308" strokeWidth="1.2" opacity="0.35" fill="none"/>
        <path d="M18 15H22L20 12L18 15Z" fill="#eab308"/>
        <rect x="19" y="15" width="2.5" height="12" rx="1" fill="#eab308"/>
        <rect x="16" y="28" width="8" height="2" rx="1" fill="#eab308" opacity="0.6"/>
      </svg>
    ),
  };
  return <span style={{ display:"inline-flex", flexShrink:0, borderRadius:8, overflow:"hidden" }}>{logos[id] || <span style={{width:s,height:s,background:"#1e293b",borderRadius:8,display:"inline-block"}}/>}</span>;
};

// ── UTILITY COMPONENTS ──────────────────────────────────────
const Stars = ({ r, size = 13 }) => (
  <span style={{ letterSpacing: 1 }}>
    {[...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < Math.floor(r) ? CYAN : i < Math.floor(r) + 1 && r % 1 >= 0.3 ? CYAN + "80" : "#1e293b", fontSize: size }}>★</span>
    ))}
  </span>
);

const Badge = ({ children, color = CYAN, bg }) => (
  <span style={{ display:"inline-block", padding:"4px 12px", fontFamily:"'Outfit',sans-serif", fontSize:12, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", border:`1px solid ${color}40`, color, background: bg || "transparent", borderRadius: 4 }}>{children}</span>
);

const CopyBtn = ({ id, copied, onCopy, full }) => (
  <button onClick={() => onCopy(id)} style={{ padding: full ? "12px 24px" : "8px 16px", width: full ? "100%" : "auto", background: CYAN, color: DARK, fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:12, letterSpacing:1, border:"none", cursor:"pointer", transition:"all 0.2s", borderRadius:4 }}>
    {copied === id ? "✓ COPIED!" : "COPY CODE"}
  </button>
);

// ── MAIN APP ────────────────────────────────────────────────
export default function ShopProps() {
  const [page, setPage] = useState("home");
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [sortBy, setSortBy] = useState("rating");
  const [filterDraw, setFilterDraw] = useState("all");
  const [filterDLL, setFilterDLL] = useState("all");
  const [copied, setCopied] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [blogPost, setBlogPost] = useState(null);
  const [firmDetail, setFirmDetail] = useState(null);
  const [searchQ, setSearchQ] = useState("");

  const handleCopy = (id) => { navigator.clipboard?.writeText(PROMO); setCopied(id); setTimeout(() => setCopied(null), 2000); };

  const toggleCompare = (id) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev);
  };

  const filtered = useMemo(() => {
    let f = [...FIRMS];
    if (filterDraw !== "all") f = f.filter(x => filterDraw === "eod" ? x.drawdownType.includes("EOD") : filterDraw === "intraday" ? x.drawdownType.includes("Intraday") : x.drawdownType.includes("Static"));
    if (filterDLL !== "all") f = f.filter(x => filterDLL === "no" ? x.dailyLossLimit === "No" || x.dailyLossLimit.includes("No") : x.dailyLossLimit === "Yes" || x.dailyLossLimit.includes("Yes"));
    if (searchQ) f = f.filter(x => x.name.toLowerCase().includes(searchQ.toLowerCase()));
    f.sort((a, b) => sortBy === "rating" ? b.rating - a.rating : sortBy === "price" ? parseInt(a.price50k.replace(/[^0-9]/g,"")) - parseInt(b.price50k.replace(/[^0-9]/g,"")) : sortBy === "payout" ? a.minPayoutDays - b.minPayoutDays : a.name.localeCompare(b.name));
    return f;
  }, [sortBy, filterDraw, filterDLL, searchQ]);

  const nav = (p, extra) => { setPage(p); setBlogPost(extra?.blog || null); setFirmDetail(extra?.firm || null); setMobileMenu(false); window.scrollTo?.(0, 0); };

  // ── STYLES ──
  const S = {
    wrap: { minHeight:"100vh", background:DARK, color:TEXT, fontFamily:"'Outfit',sans-serif", position:"relative" },
    nav: { position:"sticky", top:0, zIndex:100, background:DARK+"f0", backdropFilter:"blur(20px)", borderBottom:`1px solid ${BORDER}`, padding:"0 24px" },
    navInner: { maxWidth:1200, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", height:60 },
    logo: { fontFamily:"'Bebas Neue',sans-serif", fontSize:24, color:"#fff", cursor:"pointer", letterSpacing:1 },
    navLinks: { display:"flex", gap:24, alignItems:"center" },
    navLink: { background:"none", border:"none", color:MUTED, fontFamily:"'Outfit',sans-serif", fontSize:14, cursor:"pointer", transition:"color 0.2s", padding:0 },
    section: { maxWidth:1200, margin:"0 auto", padding:"0 24px" },
    h1: { fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(2.5rem,8vw,5rem)", color:"#fff", lineHeight:0.95, letterSpacing:1 },
    h2: { fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(1.8rem,5vw,3rem)", color:"#fff", letterSpacing:1, marginBottom:16 },
    card: { background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, padding:24, transition:"all 0.3s" },
    mono: { fontFamily:"'Space Mono',monospace" },
    grid: { display:"grid", gap:20 },
    btn: { padding:"12px 28px", background:CYAN, color:DARK, fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:13, letterSpacing:1, border:"none", cursor:"pointer", borderRadius:4, transition:"all 0.2s" },
  };

  // ── RENDER PAGES ──
  const renderNav = () => (
    <nav style={S.nav}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-track { background:${DARK}; } ::-webkit-scrollbar-thumb { background:${BORDER}; border-radius:3px; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fadein { animation: fadeIn 0.5s ease-out both; }
        .navhov:hover { color: ${CYAN} !important; }
        .cardhov:hover { border-color: ${CYAN}30 !important; transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,229,255,0.06); }
        .chk { width:18px; height:18px; border:2px solid ${BORDER}; border-radius:4px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; flex-shrink:0; }
        .chk.on { border-color:${CYAN}; background:${CYAN}20; }
        .filtbtn { padding:6px 14px; font-size:11px; font-family:'Space Mono',monospace; letter-spacing:1px; text-transform:uppercase; border:1px solid ${BORDER}; background:transparent; color:${MUTED}; cursor:pointer; transition:all 0.2s; border-radius:2px; }
        .filtbtn.on { color:${CYAN}; border-color:${CYAN}; background:${CYAN}10; }
        .filtbtn:hover { border-color:${CYAN}50; color:${CYAN}; }
        @media(max-width:768px) { .deskonly { display:none !important; } .mobmenu { display:flex !important; } }
        @media(min-width:769px) { .mobmenu { display:none !important; } .mobonly { display:none !important; } }
      `}</style>
      <div style={S.navInner}>
        <div style={{cursor:"pointer",display:"flex",alignItems:"center",gap:8}} onClick={() => nav("home")}>
          <img src="/shop_props_logo.png" alt="ShopProps" style={{height:36,width:"auto"}} />
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"#fff",letterSpacing:1}}><span style={{color:CYAN}}>SHOP</span>PROPS</span>
        </div>
        <div style={S.navLinks} className="deskonly">
          {[["home","Home"],["firms","All Firms"],["compare","Compare"],["deals","Deals"],["blog","Blog"],["learn","Learn"]].map(([p,l]) => (
            <button key={p} className="navhov" style={{...S.navLink, color: page===p ? CYAN : MUTED}} onClick={() => nav(p)}>{l}</button>
          ))}
          <button style={{...S.btn, padding:"8px 18px", fontSize:11}} onClick={() => nav("deals")}>CODE: {PROMO}</button>
        </div>
        <button className="mobonly" onClick={() => setMobileMenu(!mobileMenu)} style={{background:"none",border:"none",color:"#fff",fontSize:24,cursor:"pointer"}}>☰</button>
      </div>
      {mobileMenu && (
        <div style={{padding:"16px 0",borderTop:`1px solid ${BORDER}`,display:"flex",flexDirection:"column",gap:12}} className="mobmenu">
          {[["home","Home"],["firms","All Firms"],["compare","Compare"],["deals","Deals"],["blog","Blog"],["learn","Learn"]].map(([p,l]) => (
            <button key={p} style={{...S.navLink,textAlign:"left",padding:"8px 0",fontSize:16,color:page===p?CYAN:MUTED}} onClick={() => nav(p)}>{l}</button>
          ))}
        </div>
      )}
    </nav>
  );

  const renderPromoBar = () => (
    <div style={{background:`${CYAN}10`,borderBottom:`1px solid ${CYAN}20`,padding:"10px 24px",textAlign:"center"}}>
      <span style={{...S.mono,fontSize:12,color:CYAN,letterSpacing:1}}>
        🔥 Use code <strong>{PROMO}</strong> at checkout for exclusive discounts on all prop firms
      </span>
    </div>
  );

  // ── HOME PAGE ──
  const renderHome = () => (
    <div className="fadein">
      {/* Hero */}
      <section style={{...S.section,paddingTop:80,paddingBottom:80,textAlign:"center",maxWidth:900}}>
        <Badge>Futures Prop Firm Intelligence</Badge>
        <h1 style={{...S.h1,marginTop:32,marginBottom:24}}>
          Find Your Perfect<br/>Prop Firm.<br/><span style={{color:CYAN}}>Save Money.</span><br/>Get Funded.
        </h1>
        <p style={{fontSize:17,lineHeight:1.7,color:MUTED,maxWidth:600,margin:"0 auto 40px"}}>
          Independent comparisons of every major futures prop firm. Real data on payouts, rules, and pricing. Verified promo codes that actually work. No pay-to-rank. No BS.
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <button style={S.btn} onClick={() => nav("firms")}>↗ Browse All Firms</button>
          <button style={{...S.btn,background:"transparent",border:`1px solid ${BORDER}`,color:MUTED}} onClick={() => nav("compare")}>Compare Side-by-Side</button>
        </div>
        <div style={{display:"flex",gap:32,justifyContent:"center",marginTop:48,flexWrap:"wrap"}}>
          {[["12+","Firms Tracked"],["$0","Pay-to-Rank"],[PROMO,"Promo Code"],["Daily","Updated"]].map(([v,l]) => (
            <div key={l} style={{textAlign:"center"}}>
              <div style={{...S.mono,fontSize:24,fontWeight:700,color:CYAN}}>{v}</div>
              <div style={{...S.mono,fontSize:10,color:MUTED,letterSpacing:1,marginTop:4,textTransform:"uppercase"}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Picks */}
      <section style={{...S.section,paddingBottom:60}}>
        <h2 style={S.h2}>Quick Picks</h2>
        <div style={{...S.grid,gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))"}}>
          {[
            {title:"Fastest Payouts",firm:FIRMS.find(f=>f.id==="lucid"),reason:"~15 min processing"},
            {title:"Best for Beginners",firm:FIRMS.find(f=>f.id==="tradeify"),reason:"EOD drawdown, $0 activation"},
            {title:"Most Accounts",firm:FIRMS.find(f=>f.id==="apex"),reason:"Up to 20 simultaneous"},
            {title:"Cheapest Entry",firm:FIRMS.find(f=>f.id==="topstep"),reason:"$49/mo evaluation"},
            {title:"Best Value",firm:FIRMS.find(f=>f.id==="mff"),reason:"$77 one-time, no activation"},
            {title:"Instant Funding",firm:FIRMS.find(f=>f.id==="alphaF"),reason:"Skip the evaluation"},
          ].map(({title,firm,reason}) => (
            <div key={title} style={S.card} className="cardhov" onClick={() => nav("firm-detail",{firm:firm.id})}>
              <Badge color={CYAN}>{title}</Badge>
              <div style={{display:"flex",alignItems:"center",gap:10,margin:"16px 0 8px"}}>
                <FirmLogo id={firm.id} size={32} />
                <span style={{fontSize:18,fontWeight:700,color:"#fff"}}>{firm.name}</span>
              </div>
              <div style={{...S.mono,fontSize:11,color:MUTED}}>{reason}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:12}}>
                <Stars r={firm.rating} />
                <span style={{...S.mono,fontSize:14,fontWeight:700,color:"#fff"}}>{firm.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Firms Table */}
      <section style={{...S.section,paddingBottom:60}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
          <h2 style={{...S.h2,marginBottom:0}}>All Firms Ranked</h2>
          <button style={S.btn} onClick={() => nav("firms")}>View Full Details →</button>
        </div>
        <div style={{...S.card,padding:0,overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${BORDER}`}}>
                  {["Firm","Rating","50K Price","Drawdown","Payout Split","Payout Speed"].map(h => (
                    <th key={h} style={{...S.mono,fontSize:12,letterSpacing:2,color:MUTED,textTransform:"uppercase",padding:"16px 20px",textAlign:"left"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FIRMS.sort((a,b) => b.rating - a.rating).map(f => (
                  <tr key={f.id} style={{borderBottom:`1px solid ${BORDER}10`,cursor:"pointer"}} onClick={() => nav("firm-detail",{firm:f.id})} className="cardhov">
                    <td style={{padding:"18px 20px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <FirmLogo id={f.id} size={32} />
                        <div>
                          <div style={{fontWeight:700,color:"#fff",fontSize:16}}>{f.name}</div>
                          <div style={{fontSize:12,color:MUTED,marginTop:2}}>{f.eval}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"18px 20px"}}><span style={{fontSize:18,fontWeight:700,color:"#fff"}}>{f.rating}</span> <Stars r={f.rating} size={14}/></td>
                    <td style={{fontSize:15,color:CYAN,padding:"18px 20px",fontWeight:700}}>{f.price50k}</td>
                    <td style={{padding:"18px 20px"}}><Badge color={f.drawdownType.includes("EOD")?"#22c55e":f.drawdownType.includes("Static")?"#a78bfa":"#f59e0b"}>{f.drawdownType.split(" ")[0]}</Badge></td>
                    <td style={{fontSize:15,color:"#fff",padding:"18px 20px",fontWeight:500}}>{f.profitSplit}</td>
                    <td style={{fontSize:14,color:TEXT,padding:"18px 20px"}}>{f.payoutSpeed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section style={{...S.section,paddingBottom:60}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{...S.h2,marginBottom:0}}>Latest Guides</h2>
          <button className="navhov" style={S.navLink} onClick={() => nav("blog")}>View All →</button>
        </div>
        <div style={{...S.grid,gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))"}}>
          {BLOG_POSTS.slice(0, 3).map(p => (
            <div key={p.id} style={S.card} className="cardhov" onClick={() => nav("blog-post",{blog:p.id})}>
              <Badge>{p.category}</Badge>
              <h3 style={{fontSize:18,fontWeight:700,color:"#fff",margin:"12px 0 8px",lineHeight:1.3}}>{p.title}</h3>
              <p style={{fontSize:13,color:MUTED,lineHeight:1.6}}>{p.excerpt.slice(0,120)}...</p>
              <div style={{...S.mono,fontSize:10,color:MUTED,marginTop:12}}>{p.readTime} read · {p.date}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Promo CTA */}
      <section style={{...S.section,paddingBottom:80}}>
        <div style={{...S.card,textAlign:"center",border:`1px solid ${CYAN}20`,background:`linear-gradient(135deg,${CYAN}08,transparent)`}}>
          <h2 style={{...S.h2,marginBottom:8}}>Save on Every Prop Firm</h2>
          <p style={{color:MUTED,marginBottom:24}}>Use code <strong style={{color:CYAN}}>{PROMO}</strong> at checkout for verified discounts across all major firms.</p>
          <div style={{display:"inline-flex",alignItems:"center",gap:0,border:`1px solid ${BORDER}`,borderRadius:6,overflow:"hidden"}}>
            <div style={{padding:"12px 24px",...S.mono,fontSize:18,fontWeight:700,color:CYAN}}>{PROMO}</div>
            <CopyBtn id="hero" copied={copied} onCopy={handleCopy} />
          </div>
        </div>
      </section>
    </div>
  );

  // ── ALL FIRMS PAGE ──
  const renderFirms = () => (
    <div className="fadein" style={{...S.section,paddingTop:40,paddingBottom:80}}>
      <h1 style={{...S.h2,fontSize:"clamp(2rem,5vw,3rem)"}}>All Prop Firms</h1>
      <p style={{color:MUTED,marginBottom:24}}>Independent rankings. No pay-to-rank. Updated monthly.</p>

      {/* Filters */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
        <span style={{...S.mono,fontSize:10,color:MUTED,alignSelf:"center",marginRight:8}}>SORT:</span>
        {[["rating","Rating"],["price","Cheapest"],["payout","Fastest Payout"],["name","A-Z"]].map(([v,l]) => (
          <button key={v} className={`filtbtn ${sortBy===v?"on":""}`} onClick={() => setSortBy(v)}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
        <span style={{...S.mono,fontSize:10,color:MUTED,alignSelf:"center",marginRight:8}}>DRAWDOWN:</span>
        {[["all","All"],["eod","EOD"],["intraday","Intraday"]].map(([v,l]) => (
          <button key={v} className={`filtbtn ${filterDraw===v?"on":""}`} onClick={() => setFilterDraw(v)}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:24}}>
        <span style={{...S.mono,fontSize:10,color:MUTED,alignSelf:"center",marginRight:8}}>DAILY LOSS LIMIT:</span>
        {[["all","All"],["no","No DLL"],["yes","Has DLL"]].map(([v,l]) => (
          <button key={v} className={`filtbtn ${filterDLL===v?"on":""}`} onClick={() => setFilterDLL(v)}>{l}</button>
        ))}
      </div>

      {/* Search */}
      <input placeholder="Search firms..." value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{width:"100%",maxWidth:400,padding:"10px 16px",background:CARD,border:`1px solid ${BORDER}`,borderRadius:6,color:"#fff",fontFamily:"'Outfit',sans-serif",fontSize:14,marginBottom:24,outline:"none"}} />

      {/* Compare bar */}
      {compareIds.length > 0 && (
        <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:99,background:CARD+"f0",backdropFilter:"blur(20px)",borderTop:`1px solid ${CYAN}30`,padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{...S.mono,fontSize:12,color:CYAN}}>{compareIds.length} firms selected</span>
          <div style={{display:"flex",gap:8}}>
            <button style={{...S.btn,padding:"8px 20px",fontSize:11}} onClick={() => { setShowCompare(true); nav("compare"); }}>Compare Now →</button>
            <button style={{...S.btn,background:"transparent",border:`1px solid ${BORDER}`,color:MUTED,padding:"8px 16px",fontSize:11}} onClick={() => setCompareIds([])}>Clear</button>
          </div>
        </div>
      )}

      {/* Firm Cards */}
      <div style={{...S.grid,gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",paddingBottom:compareIds.length>0?70:0}}>
        {filtered.map(f => (
          <div key={f.id} style={{...S.card,position:"relative"}} className="cardhov">
            {/* Compare checkbox */}
            <div style={{position:"absolute",top:16,right:16,display:"flex",alignItems:"center",gap:6}} onClick={(e) => { e.stopPropagation(); toggleCompare(f.id); }}>
              <span style={{...S.mono,fontSize:9,color:MUTED}}>COMPARE</span>
              <div className={`chk ${compareIds.includes(f.id)?"on":""}`}>
                {compareIds.includes(f.id) && <span style={{color:CYAN,fontSize:12}}>✓</span>}
              </div>
            </div>

            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <FirmLogo id={f.id} size={36} />
              <div>
                <div style={{fontSize:18,fontWeight:700,color:"#fff"}}>{f.name}</div>
                <div style={{...S.mono,fontSize:10,color:MUTED}}>Est. {f.founded} · {f.hq}</div>
              </div>
            </div>

            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
              <span style={{...S.mono,fontSize:20,fontWeight:700,color:"#fff"}}>{f.rating}</span>
              <Stars r={f.rating} />
              {f.nfa && <Badge color="#22c55e">NFA</Badge>}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {[["50K Price",f.price50k],["Drawdown",f.drawdownType.split(" ")[0]],["Split",f.profitSplit],["Payout",f.payoutSpeed],["Max Acct",f.maxAccount],["Activation",f.activationFee]].map(([l,v]) => (
                <div key={l}>
                  <div style={{fontSize:11,color:MUTED,fontWeight:500,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                  <div style={{fontSize:14,color:v==="$0"?"#22c55e":"#fff",fontWeight:600}}>{v}</div>
                </div>
              ))}
            </div>

            <p style={{fontSize:14,color:MUTED,lineHeight:1.6,marginBottom:16}}>{f.desc.slice(0,140)}...</p>

            <div style={{display:"flex",gap:8}}>
              <button style={{...S.btn,flex:1,fontSize:13,padding:"12px"}} onClick={() => nav("firm-detail",{firm:f.id})}>Full Review</button>
              <button style={{...S.btn,flex:1,fontSize:13,padding:"12px",background:`${CYAN}20`,color:CYAN}} onClick={() => f.affiliate !== "#" ? window.open(f.affiliate,"_blank") : handleCopy(f.id)}>
                {f.affiliate !== "#" ? "Visit Site →" : copied === f.id ? "✓ Copied!" : `Code: ${PROMO}`}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── COMPARE PAGE ──
  const renderCompare = () => {
    const toCompare = compareIds.length > 0 ? FIRMS.filter(f => compareIds.includes(f.id)) : FIRMS.slice(0, 3);
    const fields = [
      ["Rating","rating"],["50K Price","price50k"],["Evaluation","eval"],["Profit Target (50K)","profitTarget50k"],
      ["Max Loss (50K)","maxLoss50k"],["Drawdown Type","drawdownType"],["Daily Loss Limit","dailyLossLimit"],
      ["Profit Split","profitSplit"],["First $10K","first10k"],["Payout Speed","payoutSpeed"],["Payout Frequency","payoutFreq"],
      ["Min Payout Days","minPayoutDays"],["Max Accounts","maxAccounts"],["Platforms","platforms"],
      ["Swing Trading","swingTrading"],["News Trading","newsTrading"],["Scalping","scalping"],
      ["Consistency Rule","consistency"],["Activation Fee","activationFee"],["Max Account","maxAccount"],
      ["NFA Registered","nfa"],
    ];
    return (
      <div className="fadein" style={{...S.section,paddingTop:40,paddingBottom:80}}>
        <h1 style={{...S.h2,fontSize:"clamp(2rem,5vw,3rem)"}}>Compare Prop Firms Side-by-Side</h1>
        <p style={{color:MUTED,marginBottom:24}}>Select up to 4 firms to compare every detail. Click checkboxes on the All Firms page or choose below.</p>

        {/* Selector */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:32}}>
          {FIRMS.map(f => (
            <button key={f.id} className={`filtbtn ${compareIds.includes(f.id)?"on":""}`} onClick={() => toggleCompare(f.id)}>
              <span style={{display:"inline-flex",alignItems:"center",gap:6}}><FirmLogo id={f.id} size={18} /> {f.name}</span>
            </button>
          ))}
        </div>

        {toCompare.length > 0 && (
          <div style={{...S.card,padding:0,overflow:"hidden"}}>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:toCompare.length*220}}>
                <thead>
                  <tr style={{borderBottom:`1px solid ${BORDER}`}}>
                    <th style={{fontSize:12,fontWeight:600,color:MUTED,padding:"16px",textAlign:"left",minWidth:150,letterSpacing:1,textTransform:"uppercase"}}>FEATURE</th>
                    {toCompare.map(f => (
                      <th key={f.id} style={{padding:"16px",textAlign:"center",minWidth:180}}>
                        <FirmLogo id={f.id} size={36} />
                        <div style={{fontWeight:700,color:"#fff",marginTop:6,fontSize:15}}>{f.name}</div>
                        <div style={{fontSize:13,color:MUTED,marginTop:2}}>{f.rating} ★</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fields.map(([label, key], i) => (
                    <tr key={key} style={{borderBottom:`1px solid ${BORDER}10`,background:i%2===0?"transparent":`${CARD}`}}>
                      <td style={{fontSize:13,fontWeight:500,color:MUTED,padding:"14px 16px"}}>{label}</td>
                      {toCompare.map(f => {
                        let val = f[key];
                        if (typeof val === "boolean") val = val ? "✓ Yes" : "✗ No";
                        const isGood = val === "✓ Yes" || val === "$0" || val === "No" && key === "dailyLossLimit";
                        return (
                          <td key={f.id} style={{fontSize:14,color:isGood?"#22c55e":"#fff",padding:"14px 16px",textAlign:"center",fontWeight:500}}>
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Promo row */}
                  <tr style={{borderTop:`1px solid ${CYAN}20`,background:`${CYAN}05`}}>
                    <td style={{...S.mono,fontSize:11,color:CYAN,padding:"16px",letterSpacing:1}}>PROMO CODE</td>
                    {toCompare.map(f => (
                      <td key={f.id} style={{padding:"16px",textAlign:"center"}}>
                        <div style={{...S.mono,fontSize:16,fontWeight:700,color:CYAN,marginBottom:8}}>{PROMO}</div>
                        <CopyBtn id={`cmp-${f.id}`} copied={copied} onCopy={handleCopy} />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── DEALS PAGE ──
  const renderDeals = () => (
    <div className="fadein" style={{...S.section,paddingTop:40,paddingBottom:80}}>
      <Badge>Active Promotions</Badge>
      <h1 style={{...S.h2,fontSize:"clamp(2rem,5vw,3rem)",marginTop:16}}>Best Current Deals</h1>
      <p style={{color:MUTED,marginBottom:40}}>Verified promo codes updated continuously. Use code <strong style={{color:CYAN}}>{PROMO}</strong> at checkout.</p>

      <div style={{...S.grid,gap:24}}>
        {FIRMS.sort((a,b) => b.rating - a.rating).map(f => (
          <div key={f.id} style={{...S.card,border:`1px solid ${BORDER}`,position:"relative"}} className="cardhov">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <FirmLogo id={f.id} size={36} />
                <div>
                  <div style={{fontSize:20,fontWeight:700,color:"#fff"}}>{f.name}</div>
                  <div style={{...S.mono,fontSize:10,color:MUTED}}>50K from {f.price50k}</div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(2rem,5vw,3rem)",color:CYAN,lineHeight:1}}>SAVE</div>
                <div style={{...S.mono,fontSize:10,color:MUTED,letterSpacing:2}}>WITH CODE</div>
              </div>
            </div>

            <div style={{display:"flex",gap:0,border:`1px solid ${BORDER}`,borderRadius:6,overflow:"hidden",margin:"20px 0 12px"}}>
              <div style={{padding:"10px 16px",...S.mono,fontSize:10,color:MUTED,display:"flex",alignItems:"center"}}>CODE</div>
              <div style={{flex:1,padding:"10px",...S.mono,fontSize:16,fontWeight:700,color:CYAN,display:"flex",alignItems:"center",justifyContent:"center"}}>{PROMO}</div>
              <button onClick={() => handleCopy(`deal-${f.id}`)} style={{padding:"10px 16px",background:"none",border:"none",borderLeft:`1px solid ${BORDER}`,color:copied===`deal-${f.id}`?CYAN:MUTED,...S.mono,fontSize:11,cursor:"pointer"}}>
                {copied===`deal-${f.id}` ? "✓" : "COPY"}
              </button>
            </div>

            <div style={{display:"flex",gap:8}}>
              <button style={{...S.btn,flex:1,fontSize:11}} onClick={() => f.affiliate !== "#" ? window.open(f.affiliate,"_blank") : handleCopy(`claim-${f.id}`)}>
                {f.affiliate !== "#" ? "CLAIM DEAL →" : copied===`claim-${f.id}` ? "✓ Copied!" : "COPY CODE →"}
              </button>
              <button style={{...S.btn,background:"transparent",border:`1px solid ${BORDER}`,color:MUTED,fontSize:11}} onClick={() => nav("firm-detail",{firm:f.id})}>
                Details
              </button>
            </div>

            <div style={{...S.mono,fontSize:10,color:MUTED,marginTop:12}}>
              ✓ No pay-to-rank · ✓ Verified monthly · ✓ {f.profitSplit} split
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── FIRM DETAIL PAGE ──
  const renderFirmDetail = () => {
    const f = FIRMS.find(x => x.id === firmDetail);
    if (!f) return <div style={{...S.section,paddingTop:40}}><p>Firm not found. <button style={S.navLink} onClick={() => nav("firms")}>← Back</button></p></div>;
    return (
      <div className="fadein" style={{...S.section,paddingTop:40,paddingBottom:80,maxWidth:900}}>
        <button className="navhov" style={{...S.navLink,marginBottom:24}} onClick={() => nav("firms")}>← Back to All Firms</button>

        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24}}>
          <FirmLogo id={f.id} size={56} />
          <div>
            <h1 style={{...S.h2,marginBottom:4}}>{f.name}</h1>
            <div style={{...S.mono,fontSize:12,color:MUTED}}>Est. {f.founded} · {f.hq} {f.nfa && <Badge color="#22c55e">NFA Registered</Badge>}</div>
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:32}}>
          <span style={{...S.mono,fontSize:28,fontWeight:700,color:"#fff"}}>{f.rating}</span>
          <Stars r={f.rating} size={18} />
        </div>

        <p style={{fontSize:15,lineHeight:1.7,color:TEXT,marginBottom:32}}>{f.desc}</p>

        {/* Promo */}
        <div style={{...S.card,border:`1px solid ${CYAN}20`,background:`linear-gradient(135deg,${CYAN}06,transparent)`,textAlign:"center",marginBottom:32}}>
          {f.affiliate !== "#" ? (
            <>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(2rem,5vw,3rem)",color:CYAN,lineHeight:1,marginBottom:4}}>GET STARTED WITH {f.name.toUpperCase()}</div>
              <p style={{color:MUTED,fontSize:13,margin:"12px 0 20px"}}>Click below to visit {f.name} through our verified partner link.</p>
              <button style={{...S.btn,width:"100%",padding:"16px",fontSize:14}} onClick={() => window.open(f.affiliate,"_blank")}>
                Visit {f.name} →
              </button>
              <div style={{...S.mono,fontSize:10,color:MUTED,marginTop:16}}>Also use code <strong style={{color:CYAN}}>{PROMO}</strong> at checkout for additional savings</div>
            </>
          ) : (
            <>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(2.5rem,6vw,4rem)",color:CYAN,lineHeight:1}}>SAVE WITH CODE</div>
              <div style={{...S.mono,fontSize:24,fontWeight:700,color:CYAN,margin:"12px 0"}}>{PROMO}</div>
              <CopyBtn id={`detail-${f.id}`} copied={copied} onCopy={handleCopy} full />
              <div style={{...S.mono,fontSize:10,color:MUTED,marginTop:12}}>✓ Verified · ✓ Updated monthly</div>
            </>
          )}
        </div>

        {/* Specs Grid */}
        <h3 style={{...S.h2,fontSize:22}}>Account Specifications (50K)</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:32}}>
          {[["Eval Price",f.price50k],["Evaluation Type",f.eval],["Profit Target",f.profitTarget50k],["Max Loss",f.maxLoss50k],["Drawdown Type",f.drawdownType],["Daily Loss Limit",f.dailyLossLimit],["Profit Split",f.profitSplit],["First Profits",f.first10k],["Payout Speed",f.payoutSpeed],["Payout Frequency",f.payoutFreq],["Min Payout Days",f.minPayoutDays+" days"],["Max Accounts",f.maxAccounts],["Activation Fee",f.activationFee],["Max Account Size",f.maxAccount],["Payout Cap",f.payoutCap]].map(([l,v]) => (
            <div key={l} style={S.card}>
              <div style={{fontSize:12,color:MUTED,fontWeight:500,textTransform:"uppercase",marginBottom:6}}>{l}</div>
              <div style={{fontSize:16,color:String(v)==="$0"||String(v).includes("No")&&l.includes("Daily")?"#22c55e":"#fff",fontWeight:600}}>{String(v)}</div>
            </div>
          ))}
        </div>

        {/* Rules */}
        <h3 style={{...S.h2,fontSize:22}}>Trading Rules</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:32}}>
          {[["Platforms",f.platforms],["Swing Trading",f.swingTrading],["News Trading",f.newsTrading],["Scalping",f.scalping],["Consistency Rule",f.consistency]].map(([l,v]) => (
            <div key={l} style={S.card}>
              <div style={{fontSize:12,color:MUTED,fontWeight:500,textTransform:"uppercase",marginBottom:6}}>{l}</div>
              <div style={{fontSize:15,color:v==="Yes"||v==="No"&&l==="Consistency Rule"?"#22c55e":"#fff",fontWeight:500}}>{v}</div>
            </div>
          ))}
        </div>

        {/* Pros/Cons */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:32}}>
          <div style={S.card}>
            <h4 style={{color:"#22c55e",fontSize:14,fontWeight:700,letterSpacing:1,marginBottom:12}}>✓ PROS</h4>
            {f.pros.map(p => <div key={p} style={{fontSize:15,color:TEXT,marginBottom:10,lineHeight:1.5}}>• {p}</div>)}
          </div>
          <div style={S.card}>
            <h4 style={{color:"#ef4444",fontSize:14,fontWeight:700,letterSpacing:1,marginBottom:12}}>✗ CONS</h4>
            {f.cons.map(c => <div key={c} style={{fontSize:15,color:TEXT,marginBottom:10,lineHeight:1.5}}>• {c}</div>)}
          </div>
        </div>

        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <button style={{...S.btn,flex:1}} onClick={() => f.affiliate !== "#" ? window.open(f.affiliate,"_blank") : handleCopy(`aff-${f.id}`)}>
            {f.affiliate !== "#" ? `Visit ${f.name} →` : copied===`aff-${f.id}` ? "✓ Code Copied!" : `Visit ${f.name} — Code: ${PROMO}`}
          </button>
          {f.affiliate === "#" && (
            <button style={{...S.btn,background:`${CYAN}15`,color:CYAN,flex:"0 0 auto"}} onClick={() => handleCopy(`aff2-${f.id}`)}>
              {copied===`aff2-${f.id}` ? "✓ Copied!" : `Code: ${PROMO}`}
            </button>
          )}
          <button style={{...S.btn,background:"transparent",border:`1px solid ${BORDER}`,color:MUTED}} onClick={() => { toggleCompare(f.id); nav("compare"); }}>
            Add to Compare
          </button>
        </div>
      </div>
    );
  };

  // ── BLOG LIST ──
  const renderBlog = () => (
    <div className="fadein" style={{...S.section,paddingTop:40,paddingBottom:80}}>
      <h1 style={{...S.h2,fontSize:"clamp(2rem,5vw,3rem)"}}>Guides & Comparisons</h1>
      <p style={{color:MUTED,marginBottom:32}}>In-depth articles on prop firm trading. No fluff, no affiliate bias — just useful information.</p>

      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:32}}>
        {["All","Education","Guide","Comparison","Strategy"].map(cat => (
          <button key={cat} className="filtbtn" onClick={() => {}}>{cat}</button>
        ))}
      </div>

      <div style={{...S.grid,gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))"}}>
        {BLOG_POSTS.map((p, i) => (
          <div key={p.id} style={{...S.card,cursor:"pointer"}} className="cardhov" onClick={() => nav("blog-post",{blog:p.id})}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <Badge>{p.category}</Badge>
              <span style={{...S.mono,fontSize:10,color:MUTED}}>{p.readTime}</span>
            </div>
            <h3 style={{fontSize:17,fontWeight:700,color:"#fff",lineHeight:1.3,marginBottom:8}}>{p.title}</h3>
            <p style={{fontSize:13,color:MUTED,lineHeight:1.6}}>{p.excerpt.slice(0,130)}...</p>
            <div style={{...S.mono,fontSize:10,color:CYAN,marginTop:12}}>Read more →</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── BLOG POST ──
  const renderBlogPost = () => {
    const p = BLOG_POSTS.find(x => x.id === blogPost);
    if (!p) return <div style={{...S.section,paddingTop:40}}><p>Post not found.</p></div>;
    return (
      <div className="fadein" style={{...S.section,paddingTop:40,paddingBottom:80,maxWidth:760}}>
        <button className="navhov" style={{...S.navLink,marginBottom:24}} onClick={() => nav("blog")}>← Back to Blog</button>
        <Badge>{p.category}</Badge>
        <h1 style={{...S.h2,fontSize:"clamp(1.8rem,4vw,2.5rem)",marginTop:12,marginBottom:8,lineHeight:1.2}}>{p.title}</h1>
        <div style={{display:"flex",alignItems:"center",gap:8,...S.mono,fontSize:11,color:MUTED,marginBottom:32}}><img src="/shop_props_logo.png" alt="" style={{height:16,width:"auto"}} /> {p.readTime} read · {p.date} · shopprops.co</div>

        <div style={{fontSize:15,lineHeight:1.8,color:TEXT}}>
          {p.content.split("\n\n").map((para, i) => (
            <p key={i} style={{marginBottom:20}}>{para}</p>
          ))}
        </div>

        {/* CTA */}
        <div style={{...S.card,textAlign:"center",marginTop:40,border:`1px solid ${CYAN}20`,background:`linear-gradient(135deg,${CYAN}06,transparent)`}}>
          <h3 style={{...S.h2,fontSize:22}}>Ready to Get Funded?</h3>
          <p style={{color:MUTED,marginBottom:16}}>Use code <strong style={{color:CYAN}}>{PROMO}</strong> for verified discounts on all firms.</p>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
            <button style={S.btn} onClick={() => nav("firms")}>Browse Firms</button>
            <CopyBtn id="blog-cta" copied={copied} onCopy={handleCopy} />
          </div>
        </div>

        {/* Related */}
        <h3 style={{...S.h2,fontSize:20,marginTop:48}}>Related Articles</h3>
        <div style={{...S.grid,gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))"}}>
          {BLOG_POSTS.filter(x => x.id !== p.id).slice(0, 3).map(r => (
            <div key={r.id} style={S.card} className="cardhov" onClick={() => { setBlogPost(r.id); window.scrollTo?.(0,0); }}>
              <Badge>{r.category}</Badge>
              <h4 style={{fontSize:15,fontWeight:600,color:"#fff",marginTop:8,lineHeight:1.3}}>{r.title}</h4>
              <div style={{...S.mono,fontSize:10,color:CYAN,marginTop:8}}>Read →</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── LEARN PAGE ──
  const renderLearn = () => (
    <div className="fadein" style={{...S.section,paddingTop:40,paddingBottom:80}}>
      <h1 style={{...S.h2,fontSize:"clamp(2rem,5vw,3rem)"}}>Learn Prop Trading</h1>
      <p style={{color:MUTED,marginBottom:40}}>Everything you need to know about prop firms — from how they work to advanced strategies for staying funded.</p>

      <div style={{...S.grid,gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))"}}>
        {[
          {icon:"📖",title:"What Is a Prop Firm?",desc:"Complete beginner's guide to proprietary trading firms.",blog:"what-is-prop-firm"},
          {icon:"💰",title:"How Payouts Work",desc:"From requesting your first withdrawal to understanding payout cycles.",blog:"how-payouts-work"},
          {icon:"📊",title:"Profit Splits Explained",desc:"Who keeps what? Breaking down split structures across all firms.",blog:"payout-splits"},
          {icon:"📉",title:"Drawdown Types",desc:"EOD vs intraday trailing — the most important rule difference.",blog:"drawdown-types"},
          {icon:"🎓",title:"Best Firms for Beginners",desc:"Most forgiving rules and highest probability of success.",blog:"best-beginners"},
          {icon:"💸",title:"Hidden Activation Fees",desc:"The cost that makes cheap evaluations not so cheap.",blog:"activation-fees"},
          {icon:"🚫",title:"10 Account-Blowing Mistakes",desc:"Why 90% of traders fail and how to avoid it.",blog:"avoid-mistakes"},
          {icon:"🏛️",title:"Prop Firm Taxes",desc:"How to handle taxes on prop firm profits. Deductions, S-Corps, and more.",blog:"prop-tax"},
          {icon:"📈",title:"Scaling Plans",desc:"How to grow your funded account and increase payouts over time.",blog:"scaling-plans"},
          {icon:"🖥️",title:"Platform Guide",desc:"NinjaTrader vs Tradovate vs Rithmic — which to choose.",blog:"platforms-guide"},
          {icon:"📰",title:"News Trading Rules",desc:"Can you trade FOMC and NFP on a prop account?",blog:"news-trading"},
          {icon:"📋",title:"Consistency Rules",desc:"The rule that trips up most traders — and how to handle it.",blog:"consistency-rules"},
          {icon:"🔄",title:"Account Stacking",desc:"Running multiple funded accounts to multiply income.",blog:"account-stacking"},
          {icon:"⚖️",title:"Sim vs Live Funded",desc:"Where do your trades actually go? The truth about funded accounts.",blog:"sim-vs-live"},
          {icon:"📐",title:"Choosing Account Size",desc:"50K vs 100K vs 150K — bigger isn't always better.",blog:"choosing-account-size"},
          {icon:"🏦",title:"Prop Firm vs Personal",desc:"Should you trade with a firm or fund yourself? The math.",blog:"prop-vs-personal"},
          {icon:"⚔️",title:"Apex vs Topstep",desc:"The two biggest names go head to head.",blog:"compare-apex-topstep"},
          {icon:"🆚",title:"Tradeify vs MFF",desc:"Two of the most cost-effective firms compared.",blog:"compare-tradeify-mff"},
          {icon:"⚡",title:"Fastest Payouts Ranked",desc:"From 15 minutes to 2 weeks — speed matters.",blog:"fastest-payouts"},
        ].map(item => (
          <div key={item.blog} style={S.card} className="cardhov" onClick={() => nav("blog-post",{blog:item.blog})}>
            <span style={{fontSize:32}}>{item.icon}</span>
            <h3 style={{fontSize:16,fontWeight:700,color:"#fff",margin:"8px 0 4px"}}>{item.title}</h3>
            <p style={{fontSize:13,color:MUTED,lineHeight:1.5}}>{item.desc}</p>
            <div style={{...S.mono,fontSize:10,color:CYAN,marginTop:8}}>Read guide →</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── FOOTER ──
  const renderFooter = () => (
    <footer style={{borderTop:`1px solid ${BORDER}`,padding:"48px 24px",background:CARD}}>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:32,marginBottom:40}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <img src="/shop_props_logo.png" alt="ShopProps" style={{height:32,width:"auto"}} />
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"#fff"}}><span style={{color:CYAN}}>SHOP</span>PROPS</span>
            </div>
            <p style={{fontSize:13,color:MUTED,lineHeight:1.6}}>Independent prop firm intelligence. No pay-to-rank. Updated monthly.</p>
          </div>
          <div>
            <div style={{...S.mono,fontSize:10,color:MUTED,letterSpacing:2,marginBottom:12}}>RESOURCES</div>
            {[["All Firms","firms"],["Compare","compare"],["Deals","deals"],["Blog","blog"],["Learn","learn"]].map(([l,p]) => (
              <div key={p}><button className="navhov" style={{...S.navLink,display:"block",marginBottom:8}} onClick={() => nav(p)}>{l}</button></div>
            ))}
          </div>
          <div>
            <div style={{...S.mono,fontSize:10,color:MUTED,letterSpacing:2,marginBottom:12}}>TOP GUIDES</div>
            {[["What Is a Prop Firm?","what-is-prop-firm"],["Drawdown Types","drawdown-types"],["Fastest Payouts","fastest-payouts"],["Beginner Guide","best-beginners"]].map(([l,b]) => (
              <div key={b}><button className="navhov" style={{...S.navLink,display:"block",marginBottom:8}} onClick={() => nav("blog-post",{blog:b})}>{l}</button></div>
            ))}
          </div>
          <div>
            <div style={{...S.mono,fontSize:10,color:MUTED,letterSpacing:2,marginBottom:12}}>SAVE EVERYWHERE</div>
            <div style={{...S.mono,fontSize:24,fontWeight:700,color:CYAN,marginBottom:8}}>{PROMO}</div>
            <CopyBtn id="footer" copied={copied} onCopy={handleCopy} />
          </div>
        </div>
        <div style={{borderTop:`1px solid ${BORDER}`,paddingTop:24,textAlign:"center"}}>
          <p style={{...S.mono,fontSize:10,color:"#334155",letterSpacing:1}}>
            © 2026 ShopProps.com · Independent reviews · No pay-to-rank · Not financial advice
          </p>
          <p style={{...S.mono,fontSize:9,color:"#1e293b",marginTop:8}}>
            Affiliate disclosure: Some links may earn commissions at no extra cost to you.
          </p>
        </div>
      </div>
    </footer>
  );

  return (
    <div style={S.wrap}>
      {renderNav()}
      {renderPromoBar()}
      {page === "home" && renderHome()}
      {page === "firms" && renderFirms()}
      {page === "compare" && renderCompare()}
      {page === "deals" && renderDeals()}
      {page === "blog" && renderBlog()}
      {page === "blog-post" && renderBlogPost()}
      {page === "firm-detail" && renderFirmDetail()}
      {page === "learn" && renderLearn()}
      {renderFooter()}
    </div>
  );
}
