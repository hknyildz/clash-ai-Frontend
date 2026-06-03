export const faqs = {
    builder: [
        { question: "Is there an app that scans my Clash Royale profile and builds decks based on my card levels?", answer: "Yes! ClashDeckster is designed specifically for this. By entering your player tag, the tool scans your actual card levels and collection via the official API. The AI then generates the best synergy deck built around your highest-level cards, preventing you from playing underleveled cards." },
        { question: "Is ClashDeckster free to use?", answer: "Yes, our core AI deck building feature is 100% free to use for the entire Clash Royale community." },
        { question: "How often is the meta updated?", answer: "Because our AI evaluates the live card stats and synergies dynamically, the deck suggestions automatically adapt to the latest balance changes and meta shifts." },
        { question: "Can I use this tool for Clan Wars?", answer: "Absolutely! You can choose the 'Advanced Builder' tab to select specific playstyles and fill out your 4 distinct Clan War decks without repeating cards." },
        { question: "Do I need to share my password?", answer: "Never. We only use your public player tag to read your card collection via the official Supercell API. No login or password required." },
        { question: "How does the AI pick my deck?", answer: "Our system uses Large Language Models fine-tuned for Clash Royale. It analyzes your card levels, finds the strongest synergies, and builds a custom deck that maximizes your competitive advantage." },
        { question: "Why do I keep generating the same deck?", answer: "Meta data is updated daily at midnight (CET/GMT+2). Your deck is built by finding the best synergy between your current card levels and the most up-to-date meta. Until the meta shifts or your card levels change, the AI will continue to suggest the same optimal deck." }
    ],
    calculator: [
        { question: "How can I find out how much Gold, Cards, and resources I need to max my Clash Royale cards?", answer: "You can use ClashDeckster's Clash Royale Card Upgrade Calculator. It calculates the exact amount of Gold, Cards, and Gems required to level up. You can view standard base upgrade tables or search your profile tag to get a personalized calculation based on your current collection status." },
        { question: "How much gold does it cost to max a Common card in Clash Royale?", answer: "To max a Common card from Level 1 to Level 16, you need a total of 364,005 Gold across all 15 upgrade steps. The final upgrade from Level 15 to 16 alone costs 120,000 Gold." },
        { question: "How many copies do I need to max a Legendary card?", answer: "You need 67 copies of a Legendary card to go from Level 9 (starting level) to Level 16. Since Legendary cards are rare drops, this can take a very long time without trading or purchasing." },
        { question: "What is the cheapest rarity to max in Clash Royale?", answer: "Champions have the fewest total cards needed (41 cards) but high Gold costs. Common cards need the most individual cards (28,534) but each card is easy to obtain. The 'cheapest' depends on whether you value Gold or card availability more." },
        { question: "How are Gem costs estimated?", answer: "Gem costs are estimated based on the in-game shop pricing for each rarity. We calculate how many cards you are missing and multiply by the per-card gem cost for that rarity. Actual gem prices may vary depending on special offers and bundles." },
        { question: "Can I calculate upgrade costs for my own cards?", answer: "Yes! Enter your Clash Royale player tag in the search box. The calculator will load your actual card collection and show personalized upgrade costs based on your current card levels and counts." }
    ]
};
