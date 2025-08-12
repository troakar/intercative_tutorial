// ===================================================================
//  ЭТО "ДВИЖОK" ОБУЧЕНИЯ. ФИНАЛЬНАЯ ОТЛАЖЕННАЯ ВЕРСИЯ.
//  РЕДАКТИРОВАТЬ ЭТОТ ФАЙЛ БОЛЬШЕ НЕ НУЖНО.
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {

  if (typeof GUIDED_TOUR_STEPS === 'undefined' || typeof HINTS_DATA === 'undefined') {
    console.error('Ошибка: Файл контента (content.js) не найден или в нем отсутствуют переменные.');
    return;
  }
  
  // --- СТИЛИ ДЛЯ ИСПРАВЛЕНИЯ ОТОБРАЖЕНИЯ И УЛУЧШЕНИЯ ДИЗАЙНА ---
  const customStyles = document.createElement('style');
  customStyles.innerHTML = `
    /* === Общие стили для подсказок тура и хинтов === */
    .introjs-tooltip {
      color: #e8eaed; background-color: #3c4043; border: 1px solid #5f6368;
      border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      padding: 15px 20px; min-width: 300px;
    }
    .introjs-arrow { display: none !important; }
    .introjs-bullets, .introjs-progress { display: none !important; }

    /* === Стили для кнопок тура "Далее/Назад" === */
    .introjs-tooltipbuttons { border-top: 1px solid #5f6368; padding-top: 10px; margin-top: 15px; text-align: right; }
    .introjs-button {
      background-color: #8ab4f8; color: #202124; font-weight: bold;
      border: none; border-radius: 8px; padding: 8px 16px; cursor: pointer;
      text-shadow: none;
    }
    .introjs-button:hover { background-color: #a3c5fb; }
    .introjs-skipbutton { color: #9aa0a6; background: none; float: left; }
    .introjs-skipbutton:hover { color: #e8eaed; }
    
    /* === Стили для режима подсказок (HINTS) === */
    .introjs-hint {
      background-color: rgba(234, 67, 53, 0.9) !important; /* Красный */
      border: 2px solid rgba(255, 255, 255, 0.7) !important;
    }
    .introjs-hint:hover { background-color: rgb(211, 60, 47) !important; }
    .introjs-hint.introjs-hint-visited {
      background-color: rgba(52, 168, 83, 0.9) !important; /* Зеленый */
    }
    .introjs-hint.introjs-hint-visited:hover { background-color: rgb(47, 150, 74) !important; }
    
    /* === Стили для всплывающего окна подсказки (HINT) === */
    .introjs-tooltip.introjs-hint-tooltip .introjs-tooltip-header {
        color: #8ab4f8; border-bottom: 1px solid #5f6368;
        padding-bottom: 10px; margin-bottom: 10px; font-size: 1.1em;
    }
    .introjs-tooltip.introjs-hint-tooltip .introjs-tooltiptext { font-size: 0.9em; }
    .introjs-tooltip.introjs-hint-tooltip .introjs-tooltipbuttons { display: none !important; }

    .learn-more-link { 
      display: block; margin-top: 15px; color: #8ab4f8; 
      cursor: pointer; font-weight: bold; text-decoration: none; text-align: center;
      background-color: rgba(138, 180, 248, 0.1); padding: 8px; border-radius: 8px;
    }
    .learn-more-link:hover { background-color: rgba(138, 180, 248, 0.2); }

    /* === Стили для модального окна статьи === */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); z-index: 200000; display: none; align-items: center; justify-content: center; }
    .modal-content { background: #202124; color: #e8eaed; padding: 25px 35px; border-radius: 12px; max-width: 600px; max-height: 80vh; overflow-y: auto; box-shadow: 0 5px 15px rgba(0,0,0,0.5); position: relative; }
    .modal-content h2 { margin-top: 0; color: #8ab4f8; } .modal-content hr { border-color: #5f6368; } .modal-content code { background-color: #3c4043; padding: 2px 6px; border-radius: 4px; }
    .modal-close-button { position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; color: #9aa0a6; cursor: pointer; }
  `;
  document.head.appendChild(customStyles);
  
  // --- ЛОГИКА МОДАЛЬНОГО ОКНА ---
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.innerHTML = `<div class="modal-content"><button class="modal-close-button">×</button><div class="modal-body"></div></div>`;
  document.body.appendChild(modalOverlay);
  const modalContent = modalOverlay.querySelector('.modal-body');
  const modalCloseButton = modalOverlay.querySelector('.modal-close-button');
  const showModal = (htmlContent) => { modalContent.innerHTML = htmlContent; modalOverlay.style.display = 'flex'; };
  const hideModal = () => { modalOverlay.style.display = 'none'; };
  modalCloseButton.addEventListener('click', hideModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) hideModal(); });

  // --- ПОДГОТОВКА ДАННЫХ ДЛЯ ПОДСКАЗОК ---
  const hintsDataForIntroJs = HINTS_DATA.map((item, index) => {
    let hintText = `<div class="introjs-tooltip-header">${item.title}</div>${item.hint}`;
    if (item.details && item.details.trim() !== '') {
      hintText += `<a class='learn-more-link' data-hint-index='${index}'>Узнать подробнее...</a>`;
    }
    return { element: item.selector, hint: hintText, hintPosition: 'middle-right' };
  });
  
  // --- СОЗДАНИЕ КНОПОК УПРАВЛЕНИЯ ---
  const guidedButton = document.createElement('button');
  guidedButton.innerText = 'Начать обучение';
  Object.assign(guidedButton.style, { position: 'fixed', top: '15px', left: '100px', zIndex: '100000', padding: '10px 20px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Google Sans', sans-serif", fontSize: '14px' });
  
  const hintsButton = document.createElement('button');
  hintsButton.innerText = 'Режим подсказок';
  Object.assign(hintsButton.style, { position: 'fixed', top: '15px', left: '270px', zIndex: '100000', padding: '10px 20px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Google Sans', sans-serif", fontSize: '14px' });
  
  document.body.appendChild(guidedButton);
  document.body.appendChild(hintsButton);

  // --- ИСПРАВЛЕНИЕ 1: ВОССТАНОВЛЕНА И ОТЛАЖЕНА ЛОГИКА ДЛЯ "НАЧАТЬ ОБУЧЕНИЕ" ---
  guidedButton.addEventListener('click', () => {
    introJs().setOptions({ 
      steps: GUIDED_TOUR_STEPS, 
      nextLabel: 'Далее →', 
      prevLabel: '← Назад', 
      doneLabel: 'Завершить',
      tooltipClass: 'introjs-tour-tooltip'
    }).start();
  });

  // --- ЛОГИКА ДЛЯ РЕЖИМА ПОДСКАЗОК ---
  let hintsAreVisible = false;
  hintsButton.addEventListener('click', () => {
    if (!hintsAreVisible) {
      const intro = introJs().setOptions({ 
        hints: hintsDataForIntroJs, 
        hintButtonLabel: ''
      });
      
      // ИСПРАВЛЕНИЕ 2: НОВАЯ, НАДЕЖНАЯ ЛОГИКА ДЛЯ "УЗНАТЬ ПОДРОБНЕЕ"
      intro.onhintclick((hintElement, item, stepId) => {
        // Отмечаем точку как посещенную
        const hintDot = document.querySelector(`.introjs-hint[data-step="${stepId}"]`);
        if(hintDot) hintDot.classList.add('introjs-hint-visited');

        // Находим ссылку "Узнать подробнее" ВНУТРИ открывшейся подсказки
        const link = hintElement.querySelector('.learn-more-link');
        if (link) {
          // И вешаем обработчик клика ПРЯМО НА НЕЕ
          link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const hintIndex = link.getAttribute('data-hint-index');
            const originalHintData = HINTS_DATA[hintIndex];
            if (originalHintData && originalHintData.details) {
              intro.hideHints(); // Скрываем все подсказки
              showModal(originalHintData.details);
            }
          }, { once: true }); // { once: true } гарантирует, что обработчик сработает только один раз
        }
      });

      intro.onhintsadded(() => {
        document.querySelectorAll('.introjs-tooltip').forEach(el => el.classList.add('introjs-hint-tooltip'));
      });
      
      intro.addHints();
      hintsButton.innerText = 'Скрыть подсказки';
      hintsButton.style.backgroundColor = '#ea4335';
      hintsAreVisible = true;
    } else {
      introJs().removeHints();
      hintsButton.innerText = 'Режим подсказок';
      hintsButton.style.backgroundColor = '#34a853';
      hintsAreVisible = false;
    }
  });
});