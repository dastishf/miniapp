export const parseVoiceTask = async (voiceText: string) => {
  if (!voiceText) return null;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  try {
    const listResponse = await fetch(`${baseUrl}/models?key=${apiKey}`);
    
    if (!listResponse.ok) {
      const err = await listResponse.json();
      alert(`Ошибка доступа к API: ${err.error?.message || 'Проверьте ключ'}`);
      return null;
    }

    const listData = await listResponse.json();
    
    const validModel = listData.models?.find((m: any) => 
      m.name.includes("gemini") && 
      m.supportedGenerationMethods?.includes("generateContent")
    );

    if (!validModel) {
      alert("Доступные модели не найдены. Проверьте настройки API.");
      return null;
    }

    console.log("Используем модель для задач:", validModel.name);

    // Получаем сегодняшнюю дату для контекста ИИ
    const today = new Date().toISOString().split('T')[0];

    const prompt = `System: Ты парсер задач. Сегодняшняя дата: ${today}. 
    Твоя задача — извлечь заголовок, описание, приоритет и дату дедлайна (dueDate).
    
    Правила для dueDate:
    1. Если в тексте есть срок (например, "завтра", "до пятницы", "в следующий понедельник", "25 мая"), вычисли точную дату в формате YYYY-MM-DD.
    2. Если срок вообще не упоминается, верни строго null.

    User: "${voiceText}"
    Format: {"title": "String", "description": "String", "priority": "medium"|"high"|"low", "dueDate": "YYYY-MM-DD"|null}
    JSON Only.`;

    const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${validModel.name}:generateContent?key=${apiKey}`;

    const response = await fetch(generateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1
        }
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

// ВОТ ЭТА ФУНКЦИЯ, КОТОРУЮ ТЕРЯЛ БРАУЗЕР!
export const parseVoiceReport = async (voiceText: string) => {
  if (!voiceText) return null;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  try {
    const listResponse = await fetch(`${baseUrl}/models?key=${apiKey}`);
    if (!listResponse.ok) return null;

    const listData = await listResponse.json();
    const validModel = listData.models?.find((m: any) => 
      m.name.includes("gemini") && 
      m.supportedGenerationMethods?.includes("generateContent")
    );

    if (!validModel) return null;

    console.log("Используем модель для отчетов:", validModel.name);

    const prompt = `System: Ты — интеллектуальный аналитик на крупном промышленном предприятии Казахстана. 
    Твоя задача — принять хаотичный, разговорный или сленговый голосовой отчет рабочего со смены и превратить его в строго официальный технический документ по стандартам ГОСТ и делопроизводства РК.

    Правила трансформации текста:
    1. Переводи разговорные фразы в официально-деловой стиль (например: вместо "пацаны заварили трубу" пиши "монтажной бригадой выполнены сварочные работы на трубопроводе").
    2. Убирай слова-паразиты, маты и эмоциональные выражения.
    3. Вытаскивай имена и должности, если они упоминаются.
    4. Автоматически определяй статус: "success" (если всё сделано штатно) или "warning/error" (если возникли проблемы или поломки).

    User: "${voiceText}"

    Формат ответа: ты должен вернуть СТРОГО JSON-объект следующей структуры:
    {
      "summary": "Краткая суть отчета (одно предложение в деловом стиле)",
      "technical_details": "Подробный технический текст отчета, переформатированный под требования ГОСТ",
      "status": "success" или "warning" или "error",
      "detected_personnel": "ФИО или должности упомянутых сотрудников (если нет — пиши 'Не указано')"
    }
    
    Ответь ТОЛЬКО чистым JSON объектом без использования разметки markdown (без тройных кавычек) и без лишних слов.`;

    const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${validModel.name}:generateContent?key=${apiKey}`;

    const response = await fetch(generateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Report Generate Error:", errorData);
      return null;
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiText) return null;

    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;

  } catch (error) {
    console.error("Network Error during report parsing:", error);
    return null;
  }
};