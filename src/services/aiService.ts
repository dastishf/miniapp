export const parseVoiceTask = async (voiceText: string) => {
  if (!voiceText) return null;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  try {
    // ШАГ 1: Спрашиваем у Google список доступных моделей
    const listResponse = await fetch(`${baseUrl}/models?key=${apiKey}`);
    
    if (!listResponse.ok) {
      const err = await listResponse.json();
      alert(`Ошибка доступа к API: ${err.error?.message || 'Проверьте ключ'}`);
      return null;
    }

    const listData = await listResponse.json();
    
    // Ищем модель, которая умеет генерировать контент (обычно начинается с gemini)
    const validModel = listData.models?.find((m: any) => 
      m.name.includes("gemini") && 
      m.supportedGenerationMethods?.includes("generateContent")
    );

    if (!validModel) {
      alert("Доступные модели не найдены. Проверьте настройки API.");
      return null;
    }

    console.log("Используем модель:", validModel.name); // Посмотрим в консоли, какую он выбрал

    // ШАГ 2: Отправляем запрос к найденной модели
    const prompt = `System: Ты парсер задач. Верни JSON.
    User: "${voiceText}"
    Format: {"title": "String", "description": "String", "priority": "medium"|"high"|"low"}
    JSON Only.`;

    const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${validModel.name}:generateContent?key=${apiKey}`;

    const response = await fetch(generateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Generate Error:", errorData);
      return null;
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiText) return null;

    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;

  } catch (error) {
    console.error("Network Error:", error);
    return null;
  }
};