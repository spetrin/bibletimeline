



    const START_YEAR = -4050;



    const END_YEAR = 2050;



    const STEP = 10;



    const RANGE = END_YEAR - START_YEAR;







    const zoomSlider = document.getElementById('zoom-slider');



    const zoomValue = document.getElementById('zoom-value');



    const zoomControls = document.getElementById('zoom-controls');



    const workspaceCanvas = document.getElementById('workspace-canvas');



    const workspaceViewport = document.getElementById('workspace-viewport');



    const timelineScale = document.getElementById('timeline-scale');



    const yearNav = document.getElementById('year-nav');



    const toolsPanel = document.getElementById('tools-panel');



    const toolButtons = toolsPanel.querySelectorAll('[data-tool]');



    const colorButtons = toolsPanel.querySelectorAll('[data-color]');







    let currentScale = 1;



    let currentArrowColor = 'green';



    let selectedShape = null;







    const COLOR_MAP = {



      green: getComputedStyle(document.documentElement).getPropertyValue('--arrow-green') || '#22c55e',



      yellow: getComputedStyle(document.documentElement).getPropertyValue('--arrow-yellow') || '#facc15',



      red: getComputedStyle(document.documentElement).getPropertyValue('--arrow-red') || '#ef4444',



    };







    const SHAPE_CONFIG = {



      'arrow-up': { width: 18, height: 240, minHeight: 120, maxHeight: 900 },



      'arrow-both': { width: 18, height: 280, minHeight: 140, maxHeight: 900 },



      'arrow-double-slim': { width: 20, height: 260, minHeight: 20, maxHeight: 900 },



      line: { width: 240, height: 2, minWidth: 80, maxWidth: 900 },



    };







    const POSITION_PADDING = 8;







    const pointerState = {



      mode: null,



      shape: null,



      pointerId: null,



      startX: 0,



      startY: 0,



      startLeft: 0,



      startTop: 0,



      startWidth: 0,



      startHeight: 0,



      offsetX: 0,



      offsetY: 0,



    };







    function formatYear(value) {



      if (value < 0) {



        return `${Math.abs(value)} Р В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚Сћ Р В Р’В Р В РІР‚В¦.Р В Р Р‹Р В Р Р‰.`;



      }



      return `${value} Р В Р’В Р РЋРІР‚вЂњ.`;



    }







    function tickClassForYear(year) {



      if (year % 500 === 0) return 'tick tick--major';



      if (year % 100 === 0) return 'tick tick--minor';



      if (year % 50 === 0) return 'tick tick--micro';



      return 'tick tick--mini';



    }







    function renderScale() {



      timelineScale.innerHTML = '';







      for (let year = START_YEAR; year <= END_YEAR; year += STEP) {



        const ratio = (END_YEAR - year) / RANGE;



        const tick = document.createElement('div');



        tick.dataset.year = year;







        let tickClass = 'tick tick--mini';



        let showLabel = false;







        if (year % 500 === 0) {



          tickClass = 'tick tick--major';



          showLabel = true;



        } else if (year % 100 === 0) {



          tickClass = 'tick tick--minor';



          showLabel = true;



        } else if (year % 50 === 0) {



          tickClass = 'tick tick--micro';



          showLabel = true;



        }







        tick.className = tickClass;



        tick.style.top = `${ratio * 100}%`;







        const line = document.createElement('span');



        line.className = 'tick__line';



        tick.append(line);







        if (showLabel) {



          const label = document.createElement('span');



          label.className = 'tick__label';



          label.textContent = formatYear(year);



          tick.append(label);



        }







        timelineScale.appendChild(tick);



      }



    }







    function applyZoom(scale) {



      const clamped = Math.min(Math.max(scale, 0.5), 2.5);



      currentScale = clamped;



      workspaceCanvas.style.transform = `scale(${currentScale})`;



      zoomSlider.value = Math.round(currentScale * 100);



      zoomValue.textContent = `${Math.round(currentScale * 100)}%`;



    }







    function scrollToYear(year) {



      const clampedYear = Math.min(Math.max(year, START_YEAR), END_YEAR);



      const tick = timelineScale.querySelector(`[data-year="${clampedYear}"]`);



      if (!tick) return;







      const viewportRect = workspaceViewport.getBoundingClientRect();



      const tickRect = tick.getBoundingClientRect();



      const offset = tickRect.top - viewportRect.top;



      const target = workspaceViewport.scrollTop + offset - workspaceViewport.clientHeight / 2;



      const maxScroll = workspaceViewport.scrollHeight - workspaceViewport.clientHeight;







      workspaceViewport.scrollTo({



        top: Math.min(Math.max(target, 0), Math.max(maxScroll, 0)),



        behavior: 'smooth',



      });



    }







    function getLocalPoint(event) {



      const rect = workspaceCanvas.getBoundingClientRect();



      return {



        x: (event.clientX - rect.left) / currentScale,



        y: (event.clientY - rect.top) / currentScale,



      };



    }







    function setShapePosition(shape, left, top) {



      const width = shape.offsetWidth;



      const height = shape.offsetHeight;



      const canvasWidth = workspaceCanvas.offsetWidth;



      const canvasHeight = workspaceCanvas.offsetHeight;



      const maxLeft = Math.max(canvasWidth - width, 0);



      const maxTop = Math.max(canvasHeight - height, 0);







      let clampedLeft = clamp(left, -POSITION_PADDING, maxLeft + POSITION_PADDING);



      let clampedTop = clamp(top, -POSITION_PADDING, maxTop + POSITION_PADDING);







      if (clampedLeft + width > canvasWidth + POSITION_PADDING) {



        clampedLeft = canvasWidth + POSITION_PADDING - width;



      }



      if (clampedLeft < -POSITION_PADDING) {



        clampedLeft = -POSITION_PADDING;



      }



      if (clampedTop + height > canvasHeight + POSITION_PADDING) {



        clampedTop = canvasHeight + POSITION_PADDING - height;



      }



      if (clampedTop < -POSITION_PADDING) {



        clampedTop = -POSITION_PADDING;



      }







      shape.dataset.x = `${clampedLeft}`;



      shape.dataset.y = `${clampedTop}`;



      shape.style.left = `${clampedLeft}px`;



      shape.style.top = `${clampedTop}px`;



    }







    function setShapeSize(shape, width, height) {



      if (typeof width === 'number') {



        shape.style.width = `${width}px`;



      }



      if (typeof height === 'number') {



        shape.style.height = `${height}px`;



      }



    }







    function bringToFront(shape) {



      const maxZ = Array.from(workspaceCanvas.querySelectorAll('.shape'))



        .reduce((acc, el) => Math.max(acc, parseInt(el.style.zIndex || '12', 10)), 12);



      shape.style.zIndex = String(maxZ + 1);



    }







    function clearSelection() {



      if (selectedShape) {



        selectedShape.classList.remove('shape--selected');



        selectedShape = null;



      }



    }







    function selectShape(shape) {



      if (selectedShape === shape) return;



      clearSelection();



      selectedShape = shape;



      shape.classList.add('shape--selected');



    }







    function setArrowColor(shape, colorKey) {



      if (!COLOR_MAP[colorKey]) return;



      shape.style.setProperty('--arrow-color', COLOR_MAP[colorKey]);



      shape.dataset.color = colorKey;



    }







    function updateColorControls(colorKey) {

      colorButtons.forEach((button) => {
        const isActive = button.dataset.color === colorKey;
        button.setAttribute('aria-pressed', String(isActive));
      });

    }

function removeSelectedShape() {



      if (!selectedShape) return;



      if (pointerState.shape === selectedShape) {



        pointerState.mode = null;



        pointerState.shape = null;



        pointerState.pointerId = null;



        pointerState.offsetX = 0;



        pointerState.offsetY = 0;



      }



      selectedShape.remove();



      selectedShape = null;



    }







    function createArrow(type) {



      const shape = document.createElement('div');



      shape.className = `shape shape--${type}`;



      shape.dataset.type = type;



      shape.innerHTML = `



        <div class="shape__body">



          <div class="arrow-head"></div>



          <div class="arrow-shaft"></div>



          ${(type === 'arrow-both' || type === 'arrow-double-slim') ? '<div class="arrow-head arrow-head--bottom"></div>' : ''}



        </div>



        <div class="shape__handle shape__handle--top" data-handle="top" aria-label="РЈРєРѕСЂРѕС‚РёС‚СЊ РёР»Рё СѓРґР»РёРЅРёС‚СЊ"></div>



        <div class="shape__handle shape__handle--bottom" data-handle="bottom" aria-label="РЈРєРѕСЂРѕС‚РёС‚СЊ РёР»Рё СѓРґР»РёРЅРёС‚СЊ"></div>



      `;



      return shape;



    }







    function createLine() {



      const shape = document.createElement('div');



      shape.className = 'shape shape--line';



      shape.dataset.type = 'line';



      shape.innerHTML = `



        <div class="shape__body"></div>



        <div class="shape__handle shape__handle--left" data-handle="left" aria-label="РЎРґРІРёРЅСѓС‚СЊ РєРѕРЅРµС†"></div>



        <div class="shape__handle shape__handle--right" data-handle="right" aria-label="РЎРґРІРёРЅСѓС‚СЊ РєРѕРЅРµС†"></div>



      `;



      return shape;



    }







        function placeShape(shape, type) {



      const config = SHAPE_CONFIG[type];



      setShapeSize(shape, config.width, config.height);







      const canvasWidth = workspaceCanvas.offsetWidth;



      const shapeWidth = config.width;



      const shapeHeight = config.height;







      const left = (canvasWidth - shapeWidth) / 2;



      const localScrollTop = workspaceViewport.scrollTop / currentScale;



      const centerOffset = workspaceViewport.clientHeight / (2 * currentScale);



      const top = Math.max(localScrollTop + centerOffset - shapeHeight / 2, 0);







      setShapePosition(shape, left, top);



      bringToFront(shape);



      workspaceCanvas.appendChild(shape);



      selectShape(shape);



    }







    function createShape(type) {



      let shape;



      if (type === 'line') {

        shape = createLine();

      } else {

        shape = createArrow(type);

        if (type === 'arrow-up' || type === 'arrow-both') {

          setArrowColor(shape, currentArrowColor);

        }

      }

      placeShape(shape, type);



    }







    function handleToolClick(event) {

      const button = event.currentTarget;
      const tool = button.dataset.tool;

      createShape(tool);
      toolButtons.forEach((btn) => btn.setAttribute('aria-pressed', String(btn === button)));

    }

    toolButtons.forEach((button) => button.addEventListener('click', handleToolClick));

    colorButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const color = button.dataset.color;

        currentArrowColor = color;
        updateColorControls(color);

        if (selectedShape) {
          const type = selectedShape.dataset.type;
          if (type === 'arrow-up' || type === 'arrow-both') {
            setArrowColor(selectedShape, color);
          }
        }
      });
    });

window.addEventListener('keydown', handleKeyDown);







    function clamp(value, min, max) {



      return Math.min(Math.max(value, min), max);



    }







    function handleKeyDown(event) {



      if (!selectedShape) return;



      const target = event.target;



      if (target instanceof HTMLElement) {



        const tag = target.tagName;



        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) {



          return;



        }



      }



      if (event.key === 'Delete' || event.key === 'Backspace') {



        event.preventDefault();



        removeSelectedShape();



      }



    }







    function handlePointerDown(event) {



      if (!(event.target instanceof Element)) return;



      const handle = event.target.closest('[data-handle]');



      const shape = event.target.closest('.shape');







      if (!shape || !workspaceCanvas.contains(shape)) {



        clearSelection();



        return;



      }







      event.preventDefault();



      selectShape(shape);



      bringToFront(shape);







      const local = getLocalPoint(event);



      pointerState.shape = shape;



      pointerState.pointerId = event.pointerId ?? 'mouse';



      pointerState.startX = local.x;



      pointerState.startY = local.y;



      pointerState.startLeft = parseFloat(shape.dataset.x || '0');



      pointerState.startTop = parseFloat(shape.dataset.y || '0');



      pointerState.startWidth = shape.offsetWidth;



      pointerState.startHeight = shape.offsetHeight;







      if (handle) {



        pointerState.mode = handle.dataset.handle;



      } else {



        pointerState.mode = 'move';



        pointerState.offsetX = local.x - pointerState.startLeft;



        pointerState.offsetY = local.y - pointerState.startTop;



      }







      if (shape.setPointerCapture && event.pointerId !== undefined) {



        try {



          shape.setPointerCapture(event.pointerId);



        } catch (_) {



          /* ignore */



        }



      }



    }







    function handlePointerMove(event) {



      if (!pointerState.shape || pointerState.pointerId === null) return;



      if (event.pointerId !== undefined && pointerState.pointerId !== 'mouse' && event.pointerId !== pointerState.pointerId) return;







      const shape = pointerState.shape;



      const type = shape.dataset.type;



      const local = getLocalPoint(event);







      if (pointerState.mode === 'move') {



        const newLeft = local.x - pointerState.offsetX;



        const newTop = local.y - pointerState.offsetY;



        setShapePosition(shape, newLeft, newTop);



        return;



      }







      const config = SHAPE_CONFIG[type];



      if (!config) return;







      if (pointerState.mode === 'top') {



        const delta = local.y - pointerState.startY;



        const nextHeight = clamp(pointerState.startHeight - delta, config.minHeight, config.maxHeight);



        const heightDelta = pointerState.startHeight - nextHeight;



        const nextTop = pointerState.startTop + heightDelta;



        setShapeSize(shape, null, nextHeight);



        setShapePosition(shape, pointerState.startLeft, nextTop);



      } else if (pointerState.mode === 'bottom') {



        const delta = local.y - pointerState.startY;



        const nextHeight = clamp(pointerState.startHeight + delta, config.minHeight, config.maxHeight);



        setShapeSize(shape, null, nextHeight);



      } else if (pointerState.mode === 'left') {



        const delta = local.x - pointerState.startX;



        const rightEdge = pointerState.startLeft + pointerState.startWidth;



        let newLeft = pointerState.startLeft + delta;



        const minWidth = config.minWidth ?? 20;



        const maxWidth = config.maxWidth ?? Infinity;







        newLeft = clamp(newLeft, -POSITION_PADDING, rightEdge - minWidth);



        let width = rightEdge - newLeft;



        const canvasWidth = workspaceCanvas.offsetWidth;



        const maxByCanvas = Math.max(canvasWidth + POSITION_PADDING - newLeft, minWidth);



        width = clamp(width, minWidth, Math.min(maxWidth, maxByCanvas));



        newLeft = clamp(newLeft, -POSITION_PADDING, canvasWidth + POSITION_PADDING - width);







        setShapeSize(shape, width, null);



        setShapePosition(shape, newLeft, pointerState.startTop);



      } else if (pointerState.mode === 'right') {



        const delta = local.x - pointerState.startX;



        const minWidth = config.minWidth ?? 20;



        const maxWidth = config.maxWidth ?? Infinity;



        const canvasWidth = workspaceCanvas.offsetWidth;



        const maxByCanvas = Math.max(canvasWidth + POSITION_PADDING - pointerState.startLeft, minWidth);



        const width = clamp(pointerState.startWidth + delta, minWidth, Math.min(maxWidth, maxByCanvas));



        setShapeSize(shape, width, null);



        const newLeft = clamp(pointerState.startLeft, -POSITION_PADDING, canvasWidth + POSITION_PADDING - width);



        setShapePosition(shape, newLeft, pointerState.startTop);



      }



    }







    function handlePointerUp(event) {



      if (!pointerState.shape) return;



      if (event.pointerId !== undefined && pointerState.pointerId !== 'mouse' && event.pointerId !== pointerState.pointerId) return;







      if (pointerState.shape.releasePointerCapture && event.pointerId !== undefined) {



        try {



          pointerState.shape.releasePointerCapture(event.pointerId);



        } catch (_) {



          /* ignore */



        }



      }







      pointerState.mode = null;



      pointerState.shape = null;



      pointerState.pointerId = null;



      pointerState.offsetX = 0;



      pointerState.offsetY = 0;



    }







    workspaceCanvas.addEventListener('pointerdown', handlePointerDown);



    window.addEventListener('pointermove', handlePointerMove, { passive: false });



    window.addEventListener('pointerup', handlePointerUp);



    window.addEventListener('pointercancel', handlePointerUp);







    renderScale();



    applyZoom(currentScale);







    zoomSlider.addEventListener('input', (event) => {



      applyZoom(event.target.value / 100);



    });







    zoomControls.querySelectorAll('button[data-zoom]').forEach((button) => {



      button.addEventListener('click', () => {



        const direction = button.dataset.zoom === 'in' ? 1 : -1;



        applyZoom(currentScale + 0.1 * direction);



      });



    });







    workspaceViewport.addEventListener('wheel', (event) => {



      if (!event.ctrlKey) return;



      event.preventDefault();



      const delta = event.deltaY < 0 ? 0.1 : -0.1;



      applyZoom(currentScale + delta);



    }, { passive: false });







    yearNav.querySelectorAll('button[data-year]').forEach((button) => {



      button.addEventListener('click', () => {



        const year = Number(button.dataset.year);



        scrollToYear(year);



      });



    });



  