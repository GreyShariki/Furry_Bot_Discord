const askDeepSeek = async (API_KEY) => {
  try {
    const aiUrl = "https://openrouter.ai/api/v1/chat/completions";
    const response = await fetch(aiUrl, {
      method: "POST",
      headers: {
        ContentType: "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324",
        messages: [
          {
            role: "user",
            content: `"Придумай жесткий подъёб про Владлена Саныча — тупого быдловатого технаря-неудачника. Он толстый, душный, боится женщин, смешной только самому себе, считает себя гением, но реально туп как пробка. По школе ходят слухи, что он фурри-еблан. Используй маты, грубые сравнения и максимально унижающие формулировки. Сделай акцент на его ущербности: жирный трусливый лузер с завышенной самооценкой. Пусть это будет по-хамски, но метко и смешно. Только один подъёб, без лишних слов."

Примеры:
"Владлен, твой мозг настолько тупой, что даже калькулятор при тебе впадает в депрессию, а единственное, что ты интегрируешь — это жопу в диван, уёбок."
"Саныч, ты настолько жирный, что когда заходишь в класс, гуманитарии думают, что это солнечное затмение началось, дебил конченый."
"Ты так боишься женщин, что даже твой фурсьют сдох от недотраха, утырок."`,
          },
        ],
        temperature: 0.3,
      }),
    });
    const data = await response.json();

    console.log(data.choices[0].message.content);
    return data.choices[0].message.content;
  } catch (error) {
    console.error(error);
    return "Сегодня наш экзорцист на перекуре, попросите позже";
  }
};
module.exports = { askDeepSeek };
