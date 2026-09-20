import { useState } from "react";
import { storeConfig, menuGroups, heroImage, themes, sauces } from "./config.js";
import "./App.css";

function waLink(text) {
  const base = `https://wa.me/${storeConfig.whatsappNumber}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

function formatPrice(value) {
  return `${value.toLocaleString("fr-DZ")} دج`;
}

function StoryCard({ item, onAdd }) {
  const theme = themes[item.theme] || themes.violet;

  return (
    <article
      className="story-card"
      style={{
        "--card-from": theme.from,
        "--card-to": theme.to,
      }}
    >
      <div className="story-card__glow" aria-hidden="true"></div>

      <div className="story-card__body">
        <h3 className="story-card__name">{item.name}</h3>
        <p className="story-card__desc">{item.desc}</p>
      </div>

      <div className="story-card__figure">
        <div className="story-card__shadow" aria-hidden="true"></div>

        <img
          className="story-card__img"
          src={item.image}
          alt={item.name}
          loading="lazy"
        />
      </div>

      <span className="story-card__price">
        {formatPrice(item.price)}
      </span>

      <button
        type="button"
        className="story-card__order"
        onClick={() => onAdd(item)}
      >
        أضف إلى السلة
      </button>
    </article>
  );
}


function ProductOptionsModal({ item, onClose, onConfirm }) {
  const isChapatiSpecial = item.customization === "chapati-special";
  const isMalfoufSpecial = item.customization === "malfouf-special";
  const isSpecial = isChapatiSpecial || isMalfoufSpecial;

  const defaultType = item.type || "??????";

  const [type, setType] = useState(defaultType);
  const [specialChoice, setSpecialChoice] = useState(
    isChapatiSpecial ? "cheese" : "cheese"
  );
  const [sauce, setSauce] = useState("with-sauce");
  const [extraScalop, setExtraScalop] = useState(false);
  const [extraKebda, setExtraKebda] = useState(false);

  const basePrice = isChapatiSpecial ? 250 : isMalfoufSpecial ? 300 : item.price;

  let unitPrice = basePrice;

  if (isSpecial && specialChoice === "comopair") {
    unitPrice = isChapatiSpecial ? 300 : 350;
  }

  if (isChapatiSpecial) {
    if (extraScalop) unitPrice += 50;
    if (extraKebda) unitPrice += 50;
  }

  const selectedOptions = [];

  if (isSpecial) {
    selectedOptions.push({
      id: "type",
      name: `?????: ${type}`,
      price: 0,
    });

    selectedOptions.push({
      id: specialChoice,
      name: specialChoice === "cheese" ? "????" : "???????",
      price: specialChoice === "cheese" ? 0 : isChapatiSpecial ? 50 : 50,
    });

    if (isChapatiSpecial && extraScalop) {
      selectedOptions.push({
        id: "extra-scalope",
        name: "????? ??????",
        price: 50,
      });
    }

    if (isChapatiSpecial && extraKebda) {
      selectedOptions.push({
        id: "extra-kebda",
        name: "????? ????",
        price: 50,
      });
    }
  }

  const selectedSauce =
    sauces.find((option) => option.id === sauce) || sauces[0];

  selectedOptions.push({
    id: selectedSauce.id,
    name: selectedSauce.name,
    price: 0,
  });

  function handleConfirm() {
    onConfirm({
      ...item,
      type,
      options: selectedOptions,
      unitPrice,
      quantity: 1,
      cartId: `${item.id}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
    });
  }

  return (
    <div
      className="product-options-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="product-options-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`???????? ${item.name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="product-options__header">
          <div>
            <h2>{item.name}</h2>
            <p>???? ???????? ???? ??????</p>
          </div>

          <button
            type="button"
            className="cart-modal__close"
            onClick={onClose}
            aria-label="????? ??????????"
          >
            ?
          </button>
        </div>

        {isSpecial && (
          <>
            <div className="product-options__section">
              <h3>?????? ?????</h3>

              <div className="product-options__choices">
                {["??????", "????", "????"].map((option) => (
                  <label
                    className={`product-option ${
                      type === option ? "product-option--selected" : ""
                    }`}
                    key={option}
                  >
                    <input
                      type="radio"
                      name="product-type"
                      value={option}
                      checked={type === option}
                      onChange={() => setType(option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="product-options__section">
              <h3>?????? ?????????</h3>

              <div className="product-options__choices">
                <label
                  className={`product-option ${
                    specialChoice === "cheese"
                      ? "product-option--selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="special-choice"
                    value="cheese"
                    checked={specialChoice === "cheese"}
                    onChange={() => setSpecialChoice("cheese")}
                  />
                  <span>
                    ???? ? {formatPrice(isChapatiSpecial ? 250 : 300)}
                  </span>
                </label>

                <label
                  className={`product-option ${
                    specialChoice === "comopair"
                      ? "product-option--selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="special-choice"
                    value="comopair"
                    checked={specialChoice === "comopair"}
                    onChange={() => setSpecialChoice("comopair")}
                  />
                  <span>
                    ??????? ? {formatPrice(isChapatiSpecial ? 300 : 350)}
                  </span>
                </label>
              </div>
            </div>

            {isChapatiSpecial && (
              <div className="product-options__section">
                <h3>?????? ?????</h3>

                <div className="product-options__choices">
                  <label
                    className={`product-option ${
                      extraScalop ? "product-option--selected" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={extraScalop}
                      onChange={(event) =>
                        setExtraScalop(event.target.checked)
                      }
                    />
                    <span>????? ?????? +50 ??</span>
                  </label>

                  <label
                    className={`product-option ${
                      extraKebda ? "product-option--selected" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={extraKebda}
                      onChange={(event) =>
                        setExtraKebda(event.target.checked)
                      }
                    />
                    <span>????? ???? +50 ??</span>
                  </label>
                </div>
              </div>
            )}
          </>
        )}

        <div className="product-options__section">
          <h3>?????</h3>

          <div className="product-options__choices">
            {sauces.map((option) => (
              <label
                className={`product-option ${
                  sauce === option.id ? "product-option--selected" : ""
                }`}
                key={option.id}
              >
                <input
                  type="radio"
                  name="product-sauce"
                  value={option.id}
                  checked={sauce === option.id}
                  onChange={() => setSauce(option.id)}
                />
                <span>{option.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="product-options__footer">
          <strong>{formatPrice(unitPrice)}</strong>

          <button
            type="button"
            className="product-options__confirm"
            onClick={handleConfirm}
          >
            ??? ??? ?????
          </button>
        </div>
      </div>
    </div>
  );
}

function CartModal({
  cart,
  onClose,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}) {
  const subtotal = cart.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  );

  const delivery = cart.length > 0 ? storeConfig.deliveryFee : 0;
  const total = subtotal + delivery;

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <div
      className="cart-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="cart-modal"
        role="dialog"
        aria-modal="true"
        aria-label="سلة الطلب"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cart-modal__header">
          <div>
            <h2>سلة الطلب</h2>

            <span>
              {totalItems}{" "}
              {totalItems === 1 ? "منتج" : "منتجات"}
            </span>
          </div>

          <button
            type="button"
            className="cart-modal__close"
            onClick={onClose}
            aria-label="إغلاق السلة"
          >
            ×
          </button>
        </div>

        <div className="cart-modal__items">
          {cart.map((item) => (
            <div className="cart-item" key={item.cartId}>
              <img src={item.image} alt={item.name} />

              <div className="cart-item__info">
                <strong>{item.name}</strong>

                {item.options?.length > 0 && (
                  <small>
                    الإضافات:{" "}
                    {item.options
                      .map((option) => option.name)
                      .join(" + ")}
                  </small>
                )}

                <span>{formatPrice(item.unitPrice)}</span>
              </div>

              <div className="cart-item__actions">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateQuantity(
                      item.cartId,
                      item.quantity - 1
                    )
                  }
                  aria-label={`إنقاص كمية ${item.name}`}
                >
                  −
                </button>

                <strong>{item.quantity}</strong>

                <button
                  type="button"
                  onClick={() =>
                    onUpdateQuantity(
                      item.cartId,
                      item.quantity + 1
                    )
                  }
                  aria-label={`زيادة كمية ${item.name}`}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="cart-item__remove"
                onClick={() => onRemove(item.cartId)}
              >
                حذف المنتج
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div>
            <span>مجموع المنتجات</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <div>
            <span>مصاريف التوصيل</span>
            <strong>{formatPrice(delivery)}</strong>
          </div>

          <div className="cart-summary__total">
            <span>المجموع النهائي</span>
            <strong>{formatPrice(total)}</strong>
          </div>
        </div>

        <button
          type="button"
          className="cart-modal__checkout"
          onClick={() =>
            onCheckout({
              subtotal,
              delivery,
              total,
            })
          }
        >
          تأكيد الطلب عبر واتساب
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  function addConfiguredItem(item) {
    setCart((currentCart) => [
      ...currentCart,
      {
        ...item,
        cartId:
          item.cartId ||
          `${item.id}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,
        unitPrice: item.unitPrice ?? item.price,
        quantity: item.quantity ?? 1,
      },
    ]);

    setSelectedItem(null);
    setIsCartOpen(true);
  }

  function addToCart(item) {
    if (item.customization) {
      setSelectedItem(item);
      return;
    }

    addConfiguredItem(item);
  }

  function updateQuantity(cartId, quantity) {
    if (quantity <= 0) {
      setCart((currentCart) =>
        currentCart.filter(
          (item) => item.cartId !== cartId
        )
      );

      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.cartId === cartId
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  }

  function removeFromCart(cartId) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.cartId !== cartId
      )
    );
  }

  function checkoutOrder({
    subtotal,
    delivery,
    total,
  }) {
    if (cart.length === 0) return;

    const lines = cart.map((item, index) => {
      const options =
        item.options?.length > 0
          ? `\n   الإضافات: ${item.options
              .map((option) => option.name)
              .join(" + ")}`
          : "";

      return `${index + 1}. ${item.name} × ${
        item.quantity
      } — ${formatPrice(
        item.unitPrice * item.quantity
      )}${options}`;
    });

    const message = [
      `السلام عليكم، أرغب في طلب من ${storeConfig.name}`,
      "",
      "تفاصيل الطلب:",
      ...lines,
      "",
      `مجموع المنتجات: ${formatPrice(subtotal)}`,
      `مصاريف التوصيل: ${formatPrice(delivery)}`,
      `المجموع النهائي: ${formatPrice(total)}`,
      "",
      "يرجى تأكيد الطلب.",
    ].join("\n");

    window.open(
      waLink(message),
      "_blank",
      "noopener,noreferrer"
    );
  }

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.unitPrice * item.quantity,
    0
  );

  return (
    <>
      <style>{`
        .cart-floating {
          position: fixed;
          left: 18px;
          right: 18px;
          bottom: 18px;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 12px 16px;
          border: 0;
          border-radius: 18px;
          background: #17120f;
          color: #fff;
          box-shadow: 0 12px 35px rgba(0,0,0,.28);
          cursor: pointer;
          font: inherit;
        }

        .cart-floating__info {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .cart-floating__badge {
          min-width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #e8622c;
          font-weight: 800;
        }

        .cart-floating__text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .cart-floating__text small {
          opacity: .7;
        }

        .cart-floating__price {
          font-weight: 800;
          white-space: nowrap;
        }

        .cart-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 2000;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 14px;
          background: rgba(0,0,0,.55);
        }

        .cart-modal {
          width: min(100%, 620px);
          max-height: 88vh;
          overflow-y: auto;
          direction: rtl;
          border-radius: 24px;
          background: #fff;
          color: #17120f;
          box-shadow: 0 20px 60px rgba(0,0,0,.3);
          padding: 20px;
        }

        .cart-modal__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .cart-modal__header h2 {
          margin: 0;
          font-size: 22px;
        }

        .cart-modal__header span {
          display: block;
          margin-top: 3px;
          color: #777;
          font-size: 13px;
        }

        .cart-modal__close {
          width: 42px;
          height: 42px;
          border: 0;
          border-radius: 50%;
          background: #f2f2f2;
          font-size: 28px;
          line-height: 1;
          cursor: pointer;
        }

        .cart-modal__items {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .cart-item {
          display: grid;
          grid-template-columns: 58px minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border: 1px solid #eee;
          border-radius: 16px;
        }

        .cart-item img {
          width: 58px;
          height: 58px;
          object-fit: cover;
          border-radius: 12px;
        }

        .cart-item__info {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .cart-item__info strong {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cart-item__info small {
          color: #777;
        }

        .cart-item__info span {
          font-size: 13px;
          font-weight: 700;
        }

        .cart-item__actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cart-item__actions button {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 10px;
          background: #f1f1f1;
          font-size: 20px;
          cursor: pointer;
        }

        .cart-item__remove {
          grid-column: 2 / -1;
          justify-self: start;
          border: 0;
          background: transparent;
          color: #b8202c;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
        }

        .cart-summary {
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid #eee;
        }

        .cart-summary > div {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }

        .cart-summary__total {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #eee;
          font-size: 18px;
        }

        .cart-modal__checkout {
          width: 100%;
          margin-top: 16px;
          min-height: 52px;
          border: 0;
          border-radius: 15px;
          background: #1f8f4d;
          color: #fff;
          font: inherit;
          font-weight: 800;
          cursor: pointer;
        }


        .product-options-backdrop {
          position: fixed;
          inset: 0;
          z-index: 2500;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 14px;
          background: rgba(0,0,0,.55);
        }

        .product-options-modal {
          width: min(100%, 620px);
          max-height: 90vh;
          overflow-y: auto;
          direction: rtl;
          border-radius: 24px;
          background: #fff;
          color: #17120f;
          box-shadow: 0 20px 60px rgba(0,0,0,.3);
          padding: 20px;
        }

        .product-options__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .product-options__header h2 {
          margin: 0;
          font-size: 21px;
        }

        .product-options__header p {
          margin: 5px 0 0;
          color: #777;
          font-size: 13px;
        }

        .product-options__section {
          margin-top: 16px;
        }

        .product-options__section h3 {
          margin: 0 0 9px;
          font-size: 15px;
        }

        .product-options__choices {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
        }

        .product-option {
          min-height: 48px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px 12px;
          border: 1px solid #e6e6e6;
          border-radius: 13px;
          background: #fafafa;
          cursor: pointer;
          font: inherit;
        }

        .product-option--selected {
          border-color: #e8622c;
          background: #fff5ef;
        }

        .product-option input {
          width: 18px;
          height: 18px;
          accent-color: #e8622c;
          flex: 0 0 auto;
        }

        .product-option span {
          font-size: 14px;
          font-weight: 700;
        }

        .product-options__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #eee;
        }

        .product-options__footer strong {
          font-size: 20px;
          white-space: nowrap;
        }

        .product-options__confirm {
          flex: 1;
          min-height: 50px;
          border: 0;
          border-radius: 14px;
          background: #1f8f4d;
          color: #fff;
          font: inherit;
          font-weight: 800;
          cursor: pointer;
        }

        @media (max-width: 480px) {
          .product-options__choices {
            grid-template-columns: 1fr;
          }

          .product-options__footer {
            flex-direction: column;
            align-items: stretch;
          }

          .product-options__footer strong {
            text-align: center;
          }
        }

        @media (min-width: 700px) {
          .cart-floating {
            left: auto;
            right: 24px;
            width: 330px;
          }

          .cart-modal-backdrop,
          .product-options-backdrop {
            align-items: center;
          }
        }
      `}</style>

      <header className="site-header">
        <span className="site-header__name">
          {storeConfig.name}
        </span>

        <button
          type="button"
          className="site-header__cta"
          onClick={() => setIsCartOpen(true)}
        >
          السلة {totalItems > 0 && `(${totalItems})`}
        </button>
      </header>

      <section className="hero">
        <div
          className="hero__pattern"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
          aria-hidden="true"
        ></div>

        <div
          className="hero__overlay"
          aria-hidden="true"
        ></div>

        <div className="hero__content">
          <h1 className="hero__title">
            <span className="hero__title-line hero__title-line--1">
              {storeConfig.name}
            </span>
          </h1>

          <p className="hero__tagline balance">
            {storeConfig.tagline}
          </p>

          <button
            type="button"
            className="hero__cta"
            onClick={() =>
              document
                .getElementById("chapati-normal")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            ابدأ طلبك الآن
          </button>
        </div>

        <div
          className="hero__tear"
          aria-hidden="true"
        ></div>
      </section>

      <main className="menu">
        {menuGroups.map((group) => (
          <section
            className="menu-group"
            key={group.id}
            id={group.id}
          >
            <h2 className="menu-group__title">
              {group.title}
            </h2>

            <div className="menu-group__strip">
              {group.items.map((item) => (
                <StoryCard
                  item={item}
                  key={item.id}
                  onAdd={addToCart}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      <section className="story">
        <p className="story__text balance">
          يتم إعداد كل شباتي وملفوف عند الطلب، باستخدام
          مكونات طازجة وطهي متقن، حتى يصلك طلبك ساخناً
          ولذيذاً.
        </p>
      </section>

      <footer className="site-footer">
        <div className="site-footer__info">
          <span>{storeConfig.address}</span>

          <span
            className="site-footer__dot"
            aria-hidden="true"
          ></span>

          <span>{storeConfig.hours}</span>
        </div>

        <button
          type="button"
          className="site-footer__cta"
          onClick={() => setIsCartOpen(true)}
        >
          {cart.length > 0
            ? "مراجعة الطلب"
            : "فتح السلة"}
        </button>
      </footer>

      {cart.length > 0 && (
        <button
          type="button"
          className="cart-floating"
          onClick={() => setIsCartOpen(true)}
          aria-label="فتح سلة الطلب"
        >
          <span className="cart-floating__info">
            <span className="cart-floating__badge">
              {totalItems}
            </span>

            <span className="cart-floating__text">
              <strong>سلة الطلب</strong>
              <small>اضغط لمراجعة طلبك</small>
            </span>
          </span>

          <span className="cart-floating__price">
            {formatPrice(subtotal)}
          </span>
        </button>
      )}

      {selectedItem && (
        <ProductOptionsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onConfirm={addConfiguredItem}
        />
      )}

      {isCartOpen && (
        <CartModal
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onCheckout={checkoutOrder}
        />
      )}
    </>
  );
}