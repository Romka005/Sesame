const DISHES = [
  { id: 'd1', tag: 'Завтрак', name: 'Овсянка с ягодами и кунжутом', img: '-', desc: 'Овсяная каша на кокосовом молоке, сезонные ягоды, семена кунжута и чиа.', kcal: 320, protein: 12, fat: 9, carb: 46, price: 290 },
  { id: 'd2', tag: 'Завтрак', name: 'Боул с тофу и авокадо', img: '-', desc: 'Обжаренный тофу, авокадо, шпинат, киноа, кунжутная заправка.', kcal: 410, protein: 19, fat: 21, carb: 34, price: 350 },
  { id: 'd3', tag: 'Обед', name: 'Курица терияки с рисом', img: '-', desc: 'Куриное филе гриль в соусе терияки, бурый рис, брокколи на пару.', kcal: 480, protein: 38, fat: 12, carb: 52, price: 390 },
  { id: 'd4', tag: 'Обед', name: 'Лосось с булгуром', img: '-', desc: 'Запечённый лосось, булгур с зеленью, кунжутные семена, лимон.', kcal: 520, protein: 34, fat: 24, carb: 38, price: 450 },
  { id: 'd5', tag: 'Обед', name: 'Говядина с овощами вок', img: '-', desc: 'Тонко нарезанная говядина, стручковая фасоль, перец, соус на кунжутном масле.', kcal: 460, protein: 32, fat: 18, carb: 40, price: 420 },
  { id: 'd6', tag: 'Ужин', name: 'Крем-суп из тыквы', img: '-', desc: 'Тыквенный крем-суп с имбирём, кокосовым молоком и поджаренными семечками.', kcal: 240, protein: 6, fat: 11, carb: 28, price: 260 },
  { id: 'd7', tag: 'Ужин', name: 'Салат с индейкой и киноа', img: '-', desc: 'Индейка гриль, киноа, огурец, руккола, кунжутно-медовая заправка.', kcal: 360, protein: 28, fat: 14, carb: 30, price: 340 },
  { id: 'd8', tag: 'Перекус', name: 'Энергетические шарики', img: '-', desc: 'Финики, орехи кешью, кунжут и какао — без сахара.', kcal: 180, protein: 5, fat: 9, carb: 20, price: 190 },
];

const CART_KEY = 'kunzhut_cart';

// Корзина (id, кол-во)
function getCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
  catch(e){ return {}; }
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function cartTotalItems(cart){
  return Object.values(cart).reduce((s,q)=>s+q,0);
}
function updateCartCount(){
  const cart = getCart();
  const count = cartTotalItems(cart);
  document.querySelectorAll('.cart-count').forEach(el=>{ el.textContent = count; });
}

function addToCart(id, qty=1){
  const cart = getCart();
  cart[id] = (cart[id] || 0) + qty;
  if(cart[id] <= 0) delete cart[id];
  saveCart(cart);
}
function setQty(id, qty){
  const cart = getCart();
  if(qty <= 0){ delete cart[id]; } else { cart[id] = qty; }
  saveCart(cart);
  return cart;
}
function clearCart(){
  localStorage.removeItem(CART_KEY);
  updateCartCount();
}

// Уведомление
function showToast(msg){
  let toast = document.querySelector('.toast');
  if(!toast){
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = '<span class="seed"></span> ' + msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(()=> toast.classList.remove('show'), 2200);
}

// ---------- mobile nav ----------
function initNav(){
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.main-nav');
  if(burger && nav){
    burger.addEventListener('click', ()=> nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> nav.classList.remove('open')));
  }
}

// Рендер меню
function renderMenu(){
  const grid = document.querySelector('.dish-grid');
  if(!grid) return;
  const chips = document.querySelectorAll('.filter-chip');
  let activeTag = 'Все';

  function draw(){
    const cart = getCart();
    grid.innerHTML = DISHES
      .filter(d => activeTag === 'Все' || d.tag === activeTag)
      .map(d => {
        const qty = cart[d.id] || 0;
        return `
        <article class="dish-card" data-id="${d.id}">
          <div class="dish-thumb">
            <img src="${d.img}" alt="${d.name}" onerror="this.style.display='none'; this.closest('.dish-thumb').classList.add('no-photo');">
            <span class="dish-tag">${d.tag}</span>
          </div>
          <div class="dish-body">
            <h4>${d.name}</h4>
            <p class="desc">${d.desc}</p>
            <div class="kbju">
              <span><b>${d.kcal}</b>ккал</span>
              <span><b>${d.protein}г</b>белки</span>
              <span><b>${d.fat}г</b>жиры</span>
              <span><b>${d.carb}г</b>углев.</span>
            </div>
            <div class="dish-footer">
              <span class="price">${d.price} ₽</span>
              ${qty > 0
                ? `<div class="qty-control">
                     <button class="qty-minus" aria-label="Убрать одну порцию">−</button>
                     <span class="qty">${qty}</span>
                     <button class="qty-plus" aria-label="Добавить ещё одну">+</button>
                   </div>`
                : `<button class="add-btn">В корзину</button>`}
            </div>
          </div>
        </article>`;
      }).join('');

    grid.querySelectorAll('.add-btn').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const id = e.target.closest('.dish-card').dataset.id;
        addToCart(id, 1);
        showToast('Добавили в корзину');
        draw(); renderCartBox();
      });
    });
    grid.querySelectorAll('.qty-plus').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const id = e.target.closest('.dish-card').dataset.id;
        addToCart(id, 1);
        draw(); renderCartBox();
      });
    });
    grid.querySelectorAll('.qty-minus').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const id = e.target.closest('.dish-card').dataset.id;
        addToCart(id, -1);
        draw(); renderCartBox();
      });
    });
  }

  chips.forEach(chip=>{
    chip.addEventListener('click', ()=>{
      chips.forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      activeTag = chip.dataset.tag;
      draw();
    });
  });

  draw();
}

function renderCartBox(){
  const box = document.querySelector('.cart-box');
  if(!box) return;
  const cart = getCart();
  const list = box.querySelector('.cart-lines');
  const totalEl = box.querySelector('.cart-total .num');
  const ids = Object.keys(cart);

  if(ids.length === 0){
    list.innerHTML = '<p class="cart-empty">Пока пусто — добавьте блюда из меню слева.</p>';
    totalEl.textContent = '0 ₽';
    return;
  }
  let total = 0;
  list.innerHTML = ids.map(id=>{
    const dish = DISHES.find(d=>d.id===id);
    const sum = dish.price * cart[id];
    total += sum;
    return `<div class="cart-line"><span class="name">${dish.name} × ${cart[id]}</span><span class="sum">${sum} ₽</span></div>`;
  }).join('');
  totalEl.textContent = total + ' ₽';
}

// ---------- КБЖУ калькулятор (прототип, формула Миффлина-Сан Жеора) ----------
function initCalculators(){
  document.querySelectorAll('.calc-box').forEach(box=>{
    const form = box.querySelector('.calc-form');
    if(!form) return;

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const gender = form.querySelector('[name="gender"]').value;
      const age = parseFloat(form.querySelector('[name="age"]').value);
      const height = parseFloat(form.querySelector('[name="height"]').value);
      const weight = parseFloat(form.querySelector('[name="weight"]').value);
      const activity = parseFloat(form.querySelector('[name="activity"]').value);
      const goal = form.querySelector('[name="goal"]').value;

      if(!age || !height || !weight){
        showToast('Заполните все поля');
        return;
      }

      // базовый обмен веществ (Mifflin-St Jeor) — прототип, требует доработки
      let bmr = gender === 'female'
        ? 10*weight + 6.25*height - 5*age - 161
        : 10*weight + 6.25*height - 5*age + 5;

      let kcal = bmr * activity;
      if(goal === 'lose') kcal *= 0.85;
      if(goal === 'gain') kcal *= 1.15;

      const protein = Math.round(weight * (goal === 'gain' ? 2 : 1.6));
      const fat = Math.round((kcal * 0.25) / 9);
      const carb = Math.round((kcal - protein*4 - fat*9) / 4);

      const result = box.querySelector('.calc-result');
      result.innerHTML = `
        <span class="label">Ваша дневная норма</span>
        <div class="kcal-num">${Math.round(kcal)} <span>ккал</span></div>
        <div class="calc-macros">
          <div><b>${protein} г</b><span>белки</span></div>
          <div><b>${fat} г</b><span>жиры</span></div>
          <div><b>${carb} г</b><span>углеводы</span></div>
        </div>`;
    });
  });
}

// ---------- чек-лист (личный, хранится в localStorage) ----------
const CHECKLIST_KEY = 'kunzhut_checklist';

function getChecklist(){
  try{ return JSON.parse(localStorage.getItem(CHECKLIST_KEY)) || []; }
  catch(e){ return []; }
}
function saveChecklist(items){
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify(items));
}
function renderChecklist(){
  const list = document.querySelector('.checklist-items');
  if(!list) return;
  const items = getChecklist();
  const progress = document.querySelector('.checklist-progress');

  if(items.length === 0){
    list.innerHTML = '<li class="checklist-empty" style="border:none;">Список пуст — добавьте первую задачу выше.</li>';
  } else {
    list.innerHTML = items.map((item, i)=>`
      <li class="${item.done ? 'done' : ''}" data-i="${i}">
        <input type="checkbox" ${item.done ? 'checked' : ''}>
        <span class="text">${item.text}</span>
        <button class="del">Удалить</button>
      </li>`).join('');
  }

  if(progress){
    const doneCount = items.filter(i=>i.done).length;
    progress.textContent = items.length
      ? `Выполнено ${doneCount} из ${items.length}`
      : 'Задач пока нет';
  }

  list.querySelectorAll('input[type="checkbox"]').forEach(cb=>{
    cb.addEventListener('change', (e)=>{
      const i = e.target.closest('li').dataset.i;
      const items = getChecklist();
      items[i].done = e.target.checked;
      saveChecklist(items);
      renderChecklist();
    });
  });
  list.querySelectorAll('.del').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const i = e.target.closest('li').dataset.i;
      const items = getChecklist();
      items.splice(i, 1);
      saveChecklist(items);
      renderChecklist();
    });
  });
}
function initChecklistForm(){
  const form = document.querySelector('.checklist-add');
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const input = form.querySelector('input');
    const text = input.value.trim();
    if(!text) return;
    const items = getChecklist();
    items.push({ text, done: false });
    saveChecklist(items);
    input.value = '';
    renderChecklist();
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  initNav();
  updateCartCount();
  renderMenu();
  renderCartBox();
  initCalculators();
  renderChecklist();
  initChecklistForm();

  const clearBtn = document.querySelector('.cart-clear');
  if(clearBtn){
    clearBtn.addEventListener('click', ()=>{
      clearCart();
      renderMenu();
      renderCartBox();
      showToast('Корзина очищена');
    });
  }

  // contact form (demo only, no backend)
  const form = document.querySelector('.contact-form');
  if(form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      showToast('Заявка отправлена, свяжемся в течение часа');
      form.reset();
    });
  }
});
