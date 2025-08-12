// ===================================================================
//  ЭТО "ДВИЖОК" ОБУЧЕНИЯ. ФИНАЛЬНАЯ, РАБОЧАЯ ВЕРСИЯ.
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {

  if (typeof GUIDED_TOUR_STEPS === 'undefined' || typeof HINTS_DATA === 'undefined') {
    alert('Критическая ошибка: Файл контента (content.js) не найден.');
    return;
  }
  
  // --- СТИЛИЗАЦИЯ ---
  const customStyles = document.createElement('style');
  customStyles.innerHTML = `
    /* Анимация пульсирующей красной точки для хинтов */
    @keyframes pulsate-red {
      0% { box-shadow: 0 0 0 0 rgba(234, 67, 53, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(234, 67, 53, 0); }
      100% { box-shadow: 0 0 0 0 rgba(234, 67, 53, 0); }
    }
    /* Анимация пульсирующей голубой рамки для режима обучения (применяется к самому элементу) */
    @keyframes pulse-blue-highlight {
      0% { box-shadow: 0 0 0 0 rgba(138, 180, 248, 0.7); }
      70% { box-shadow: 0 0 0 15px rgba(138, 180, 248, 0); }
      100% { box-shadow: 0 0 0 0 rgba(138, 180, 248, 0); }
    }

    /* Общие стили для Intro.js тултипов */
    .introjs-tooltip {
      color: #e8eaed !important; background-color: #3c4043 !important;
      border: 1px solid #5f6368 !important; border-radius: 16px !important;
      min-width: 320px !important;
    }
    .introjs-arrow { display: none !important; }
    .introjs-bullets, .introjs-progress { display: none !important; }
    .introjs-tooltipbuttons { border-top: 1px solid #5f6368 !important; padding-top: 10px !important; margin-top: 15px !important; text-align: right !important; }
    .introjs-button {
      background-color: #8ab4f8 !important; color: #202124 !important; font-weight: bold !important;
      border: none !important; border-radius: 8px !important; padding: 8px 16px !important;
      text-shadow: none !important;
    }
    .introjs-skipbutton { color: #9aa0a6 !important; background: none !important; float: left !important; }

    /* Фон-оверлей в режиме обучения теперь красный и полупрозрачный */
    .introjs-overlay {
      background-color: rgba(234, 67, 53, 0.25) !important; /* Красный с 25% прозрачности */
    }

    /* Стили для подсветки самого элемента в режиме "Начать обучение" */
    .highlighted-tour-element {
      position: relative; /* Важно для z-index */
      z-index: 9999999 !important; /* Над оверлеем */
      border: 3px solid #8ab4f8 !important; /* Яркая голубая рамка */
      border-radius: 8px !important; /* Слегка скругленные углы */
      box-shadow: 0 0 0 0 rgba(138, 180, 248, 0.7) !important; /* Начальное состояние для пульсации */
      animation: pulse-blue-highlight 1.5s infinite ease-out !important; /* Применяем анимацию пульсации */
      padding: 2px;
      margin: -2px; /* Компенсируем padding, чтобы не сдвигать лейаут */
    }

    /* Стили для точек-подсказок (хинтов) */
    .introjs-hint {
      width: 12px !important; height: 12px !important; padding: 0 !important;
      background: #ea4335 !important; /* Красный цвет по умолчанию */
      border: 2px solid white !important;
      border-radius: 50% !important; box-shadow: 0 0 0 0 rgba(234, 67, 53, 0.7) !important;
      animation: pulsate-red 2s infinite !important;
      transition: background-color 0.3s ease-in-out;
    }
    .introjs-hint:hover { background: #d93025 !important; }
    .introjs-hint.introjs-hint-visited { 
      background: #34a853 !important; /* Зеленый цвет */
      animation: none !important; /* Отключаем пульсацию после посещения */
      box-shadow: none !important; /* Отключаем тень */
    }
    .introjs-hint.introjs-hint-visited:hover { background: #1e8e3e !important; }

    /* Стили для всплывающего окна подсказки (HINT tooltip) */
    .introjs-tooltip.introjs-hint-tooltip .introjs-tooltip-header {
      color: #8ab4f8; border-bottom: 1px solid #5f6368; padding-bottom: 10px; margin-bottom: 10px; font-size: 1.1em;
    }
    .introjs-tooltip.introjs-hint-tooltip .introjs-tooltiptext { font-size: 0.9em; }
    .learn-more-link { display: block; margin-top: 15px; color: #8ab4f8; cursor: pointer; text-align: center; background-color: rgba(138, 180, 248, 0.1); padding: 8px; border-radius: 8px; }
    .learn-more-link:hover { background-color: rgba(138, 180, 248, 0.2); }

    /* Стили для модального окна статьи */
    .modal-overlay { 
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0, 0, 0, 0.7); 
      z-index: 9999999 !important; /* Должен быть выше Intro.js тултипа */
      display: none; align-items: center; justify-content: center; 
    }
    .modal-content { background: #202124; color: #e8eaed; padding: 25px 35px; border-radius: 12px; max-width: 600px; max-height: 80vh; overflow-y: auto; position: relative; }
    .modal-content h2 { margin-top: 0; color: #8ab4f8; } .modal-content code { background-color: #3c4043; padding: 2px 6px; border-radius: 4px; }
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
  const hideModal = () => { modalContent.innerHTML = ''; modalOverlay.style.display = 'none'; }; 
  modalCloseButton.addEventListener('click', hideModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) hideModal(); });

  // --- ПОДГОТОВКА ДАННЫХ ДЛЯ ПОДСКАЗОК ---
  const hintsDataForIntroJs = HINTS_DATA.map((item, index) => {
    let hintText = `<div class="introjs-tooltip-header">${item.title}</div>${item.hint}`;
    if (item.details && item.details.trim() !== '') {
      hintText += `<a class='learn-more-link' data-hint-index='${index}'>Узнать подробнее...</a>`;
    }
    return { element: item.selector, hint: hintText, hintPosition: item.hintPosition || 'middle-right' };
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

  // --- ЛОГИКА ДЛЯ "НАЧАТЬ ОБУЧЕНИЕ" ---
  guidedButton.addEventListener('click', () => {
    // Если режим подсказок активен, сначала выключим его
    if (hintsAreVisible) {
        toggleHintsVisibility(false);
    }

    introJs().setOptions({ 
      steps: GUIDED_TOUR_STEPS, 
      nextLabel: 'Далее →', 
      prevLabel: '← Назад', 
      doneLabel: 'Завершить'
      // overlayOpacity убран, стили в CSS
    })
    .onbeforechange(function(element) {
        document.querySelectorAll('.highlighted-tour-element').forEach(el => {
            el.classList.remove('highlighted-tour-element');
        });
        if (element) {
            // Плавная прокрутка к элементу перед его подсветкой
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Добавляем класс подсветки с небольшой задержкой, чтобы анимация успела примениться
            setTimeout(() => {
                element.classList.add('highlighted-tour-element');
            }, 100); // Задержка в 100мс
        }
    })
    .oncomplete(function() {
        document.querySelectorAll('.highlighted-tour-element').forEach(el => {
            el.classList.remove('highlighted-tour-element');
        });
    })
    .onexit(function() {
        document.querySelectorAll('.highlighted-tour-element').forEach(el => {
            el.classList.remove('highlighted-tour-element');
        });
    })
    .start();
  });

  // --- ЛОГИКА ДЛЯ "РЕЖИМ ПОДСКАЗОК" ---
  let hintsAreVisible = false;
  let hintsInitialized = false;
  let hintElements = [];
  let introInstanceForHints;

  hintsButton.addEventListener('click', () => {
    if (!hintsInitialized) {
      // --- ПЕРВЫЙ ЗАПУСК: СОЗДАЕМ ПОДСКАЗКИ ---
      introInstanceForHints = introJs().setOptions({ 
        hints: hintsDataForIntroJs, 
        hintButtonLabel: 'Изучено',
        overlayOpacity: 0 // В режиме подсказок оверлей не нужен
      });

      introInstanceForHints.onhintclose((stepId) => {
        const hintDot = document.querySelector(`.introjs-hint[data-step="${stepId}"]`);
        if (hintDot) {
          hintDot.classList.add('introjs-hint-visited');
        }
      });
      
      introInstanceForHints.onhintclick((hintElement, item, stepId) => {
        setTimeout(() => {
          const activeTooltip = document.querySelector('.introjs-tooltip');
          if (!activeTooltip) return;

          const learnMoreLink = activeTooltip.querySelector('.learn-more-link');
          const defaultButton = activeTooltip.querySelector('.introjs-button');
          const buttonContainer = activeTooltip.querySelector('.introjs-tooltipbuttons');
          
          if (defaultButton) {
            defaultButton.innerText = 'Изучено';
          }

          if (learnMoreLink) {
            if (buttonContainer) buttonContainer.style.display = 'none';
            learnMoreLink.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              const hintIndex = learnMoreLink.getAttribute('data-hint-index');
              const originalHintData = HINTS_DATA[hintIndex];
              if (originalHintData && originalHintData.details) {
                // Закрываем только текущий тултип Intro.js, чтобы точки остались
                introInstanceForHints.exit(); 
                const currentHintDot = document.querySelector(`.introjs-hint[data-step="${stepId}"]`);
                if (currentHintDot) {
                    currentHintDot.classList.add('introjs-hint-visited');
                }
                showModal(originalHintData.details);
              }
            };
          } else {
            if (buttonContainer) buttonContainer.style.display = 'block';
          }
        }, 1);
      });

      introInstanceForHints.onhintsadded(() => {
        hintElements = document.querySelectorAll('.introjs-hint');
        hintsInitialized = true;
        toggleHintsVisibility(true); // Показываем только что созданные хинты
      });
      
      introInstanceForHints.addHints();
      
    } else {
      toggleHintsVisibility(!hintsAreVisible);
    }
  });

  function toggleHintsVisibility(show) {
    if (show) {
      hintElements.forEach(el => el.style.display = 'block');
      hintsButton.innerText = 'Скрыть подсказки';
      hintsButton.style.backgroundColor = '#ea4335';
      hintsAreVisible = true;
    } else {
      if (introInstanceForHints) introInstanceForHints.exit(); // Закрываем любой открытый тултип
      hintElements.forEach(el => el.style.display = 'none');
      hintsButton.innerText = 'Режим подсказок';
      hintsButton.style.backgroundColor = '#34a853';
      hintsAreVisible = false;
    }
  }
});