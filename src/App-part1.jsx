import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  storeConfig,
  menuGroups,
  heroImage,
  themes,
  sauces,
} from "./config.js";
import "./App.css";
import { supabase } from "./supabase.js";
import { playClickSound, playSwipeSound, playNotificationSound, playOrderStatusSound, playPointsSound, playSuccessSound } from "./sound.js";
import OwnerDashboard from "./OwnerDashboard.jsx";
import DriverDashboard from "./DriverDashboard.jsx";

function formatPrice(value) {
  return `${value.toLocaleString("fr-DZ")} دج`;
}

/* =========================================================
   PRODUCT CARD
   ========================================================= */

function StoryCard({ item, onAdd, allowQuantity, available = true }) {
  const theme = themes[item.theme] || themes.violet;
  const [quantity, setQuantity] = useState(1);

  function handleAdd() {
    if (!available) return;

    onAdd(item, quantity);
    setQuantity(1);
  }

  return (
    <article
      className={`story-card ${
        available ? "" : "story-card--unavailable"
      }`}
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

      {/* Glow 2 style */}
      <div className="story-card__figure glow2-product">
        <div
          className="glow2-product__light"
          aria-hidden="true"
        ></div>

        <div
          className="story-card__shadow"
          aria-hidden="true"
        ></div>

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

      <span
        className={`story-card__availability ${
          available ? "is-available" : "is-unavailable"
        }`}
      >
        {available
          ? "\u0645\u062a\u0648\u0641\u0631"
          : "\u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631"}
      </span>

      {allowQuantity && available && (
        <div className="story-card__qty">
          <button
            type="button"
            onClick={() =>
              setQuantity((q) => Math.max(1, q - 1))
            }
            aria-label={`إنقاص كمية ${item.name}`}
          >
            -
          </button>

          <strong>{quantity}</strong>

          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label={`زيادة كمية ${item.name}`}
          >
            +
          </button>
        </div>
      )}

      <button
        type="button"
        className="story-card__order"
        onClick={handleAdd}
        disabled={!available}
      >
        {available
          ? "\u0623\u0636\u0641 \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629"
          : "\u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631"}
      </button>
    </article>
  );
}

/* =========================================================
   PRODUCT OPTIONS
   ========================================================= */

function ProductOptionsModal({
  item,
  onClose,
  onConfirm,
}) {
  const isChapatiSpecial =
    item.customization === "chapati-special";

  const isMalfoufSpecial =
    item.customization === "malfouf-special";

  const isSpecial =
    isChapatiSpecial || isMalfoufSpecial;

  const isDrink =
    item.customization === "drink";

  const [drinkSize, setDrinkSize] = useState(
    item.drinkSizes?.[0]?.id || "large"
  );

  const [quantity, setQuantity] = useState(
    item.initialQuantity || 1
  );

  const detectedFilling =
    item.name?.includes("سكالوب")
      ? "سكالوب"
      : item.name?.includes("كبدة")
        ? "كبدة"
        : item.name?.includes("ميكس")
          ? "ميكس"
          : null;

  const defaultType =
    ["سكالوب", "كبدة", "ميكس"].includes(item.type)
      ? item.type
      : detectedFilling || "عادي";

  const [type, setType] = useState(defaultType);

  const [specialChoice, setSpecialChoice] =
    useState("cheese");

  const [sauce, setSauce] = useState(["mayonnaise"]);

  const [extraFilling, setExtraFilling] =
    useState(false);

  const [freeExtras, setFreeExtras] =
    useState([]);

  const basePrice = isChapatiSpecial
    ? 250
    : isMalfoufSpecial
      ? 300
      : item.price;

  const fillingType = isSpecial
    ? ["سكالوب", "كبدة", "ميكس"].includes(type)
      ? type
      : detectedFilling
    : detectedFilling;

  let unitPrice = basePrice;

  if (isDrink) {
    const selectedDrinkSize =
      item.drinkSizes?.find(
        (size) => size.id === drinkSize
      );

    unitPrice =
      selectedDrinkSize?.price ?? item.price;
  }

  if (
    isSpecial &&
    specialChoice === "comopair"
  ) {
    unitPrice = isChapatiSpecial ? 300 : 350;
  }

  if (extraFilling && fillingType) {
    unitPrice += 50;
  }

  const selectedOptions = [];

  if (isDrink) {
    const selectedDrinkSize =
      item.drinkSizes?.find(
        (size) => size.id === drinkSize
      );

    if (selectedDrinkSize) {
      selectedOptions.push({
        id: `drink-size-${selectedDrinkSize.id}`,
        name: `الحجم: ${selectedDrinkSize.name}`,
        price: 0,
      });
    }
  }

  if (isSpecial) {
    if (isChapatiSpecial) {
      selectedOptions.push({
        id: "type",
        name: `النوع: ${type}`,
        price: 0,
      });
    }

    selectedOptions.push({
      id: specialChoice,
      name:
        specialChoice === "cheese"
          ? "شيزي"
          : "كوموبير",
      price:
        specialChoice === "cheese"
          ? 0
          : 50,
    });
  }

  if (extraFilling && fillingType) {
    selectedOptions.push({
      id:
        fillingType === "سكالوب"
          ? "extra-scalope"
          : fillingType === "كبدة"
            ? "extra-kebda"
            : "extra-mix",
      name: `إضافة ${fillingType}`,
      price: 50,
    });
  }

  const freeExtraOptions = [
    {
      id: "onion",
      name: "بصل",
    },
    {
      id: "dabcha",
      name: "دبشة",
    },
    {
      id: "pepper",
      name: "فلفل",
    },
  ];

  if (!isDrink) {
    freeExtras.forEach((extraId) => {
      const extra = freeExtraOptions.find(
        (option) => option.id === extraId
      );

      if (extra) {
        selectedOptions.push({
          id: extra.id,
          name: extra.name,
          price: 0,
        });
      }
    });

    sauce.forEach((sauceId) => {
      const selectedSauce = sauces.find(
        (option) => option.id === sauceId
      );

      if (selectedSauce) {
        selectedOptions.push({
          id: selectedSauce.id,
          name: selectedSauce.name,
          price: 0,
        });
      }
    });
  }

  function handleConfirm() {
    onConfirm({
      ...item,
      type,
      options: selectedOptions,
      unitPrice,
      quantity,
      cartId: `${item.id}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
    });
  }

  function toggleFreeExtra(extraId) {
    setFreeExtras((current) =>
      current.includes(extraId)
        ? current.filter(
            (id) => id !== extraId
          )
        : [...current, extraId]
    );
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
        aria-label={`خيارات المنتج ${item.name}`}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="product-options__header">
          <div>
            <h2>{item.name}</h2>

            <p>
              {isDrink
                ? "اختر الحجم"
                : "اختر الإضافات التي تريدها"}
            </p>
          </div>

          <button
            type="button"
            className="cart-modal__close"
            onClick={onClose}
            aria-label="إغلاق النافذة"
          >
            ×
          </button>
        </div>

        {isDrink && (
          <div className="product-options__section">
            <h3>الحجم</h3>

            <div className="product-options__choices">
              {item.drinkSizes?.map((option) => (
                <label
                  className={`product-option ${
                    drinkSize === option.id
                      ? "product-option--selected"
                      : ""
                  }`}
                  key={option.id}
                >
                  <input
                    type="radio"
                    name={`drink-size-${item.id}`}
                    value={option.id}
                    checked={drinkSize === option.id}
                    onChange={() =>
                      setDrinkSize(option.id)
                    }
                  />

                  <span>
                    {option.name} -{" "}
                    {formatPrice(option.price)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {!isDrink && isSpecial && (
          <>
            {isChapatiSpecial && (
              <div className="product-options__section">
                <h3>نوع الحشوة</h3>

                <div className="product-options__choices">
                  {[
                    "سكالوب",
                    "كبدة",
                    "ميكس",
                  ].map((option) => (
                    <label
                      className={`product-option ${
                        type === option
                          ? "product-option--selected"
                          : ""
                      }`}
                      key={option}
                    >
                      <input
                        type="radio"
                        name="product-type"
                        value={option}
                        checked={type === option}
                        onChange={() => {
                          setType(option);
                          setExtraFilling(false);
                        }}
                      />

                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="product-options__section">
              <h3>الإضافة الخاصة</h3>

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
                    checked={
                      specialChoice === "cheese"
                    }
                    onChange={() =>
                      setSpecialChoice("cheese")
                    }
                  />

                  <span>
                    شيزي + {formatPrice(50)}
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
                    checked={
                      specialChoice === "comopair"
                    }
                    onChange={() =>
                      setSpecialChoice("comopair")
                    }
                  />

                  <span>
                    كوموبير + {formatPrice(100)}
                  </span>
                </label>
              </div>
            </div>
          </>
        )}

        {!isDrink && fillingType && (
          <div className="product-options__section">
            <h3>إضافة حشوة</h3>

            <div className="product-options__choices">
              <label
                className={`product-option ${
                  extraFilling
                    ? "product-option--selected"
                    : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={extraFilling}
                  onChange={(event) =>
                    setExtraFilling(
                      event.target.checked
                    )
                  }
                />

                <span>
                  إضافة {fillingType} +50 دج
                </span>
              </label>
            </div>
          </div>
        )}

        {!isDrink && fillingType && (
          <div className="product-options__section">
            <h3>إضافات مجانية</h3>

            <div className="product-options__choices">
              {freeExtraOptions.map(
                (option) => {
                  const selected =
                    freeExtras.includes(
                      option.id
                    );

                  return (
                    <label
                      className={`product-option ${
                        selected
                          ? "product-option--selected"
                          : ""
                      }`}
                      key={option.id}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          toggleFreeExtra(
                            option.id
                          )
                        }
                      />

                      <span>
                        {option.name} مجاني
                      </span>
                    </label>
                  );
                }
              )}
            </div>
          </div>
        )}

        {!isDrink && (
          <div className="product-options__section">
            <h3>الصلصة</h3>

            <div className="product-options__choices">
              {sauces.map((option) => (
                <label
                  className={`product-option ${
                    sauce.includes(option.id)
                      ? "product-option--selected"
                      : ""
                  }`}
                  key={option.id}
                >
                  <input
                    type="checkbox"
                    name="product-sauce"
                    value={option.id}
                    checked={sauce.includes(
                      option.id
                    )}
                    onChange={() =>
                      setSauce((current) =>
                        current.includes(option.id)
                          ? current.filter(
                              (id) =>
                                id !== option.id
                            )
                          : [
                              ...current,
                              option.id,
                            ]
                      )
                    }
                  />

                  <span>{option.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="product-options__footer">
          <strong>
            {formatPrice(
              unitPrice * quantity
            )}
          </strong>

          <div className="product-options__qty">
            <button
              type="button"
              onClick={() =>
                setQuantity((q) =>
                  Math.max(1, q - 1)
                )
              }
              aria-label="إنقاص الكمية"
            >
              -
            </button>

            <span>{quantity}</span>

            <button
              type="button"
              onClick={() =>
                setQuantity((q) => q + 1)
              }
              aria-label="زيادة الكمية"
            >
              +
            </button>
          </div>

          <button
            type="button"
            className="product-options__confirm"
            onClick={handleConfirm}
          >
            إضافة إلى السلة
          </button>
        </div>
      </div>
    </div>
  );
}
function CartModal({
  cart,
  customer,
  customerPoints,
  onClose,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}) {
  const [customerName, setCustomerName] =
    useState(customer?.name || "");

  const [customerPhone, setCustomerPhone] =
    useState(customer?.phone || "");

  const [customerAddress, setCustomerAddress] =
    useState("");

  const [customerLatitude, setCustomerLatitude] =
    useState(null);

  const [customerLongitude, setCustomerLongitude] =
    useState(null);

  
  const [promoCode, setPromoCode] =
    useState("");

  const [discountMethod, setDiscountMethod] =
    useState("none");

  const [starsToUse, setStarsToUse] =
    useState(10);

  const [gpsLoading, setGpsLoading] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  function handleGetCustomerLocation() {
    if (!navigator.geolocation) {
      setFormError(
        "المتصفح لا يدعم تحديد الموقع."
      );
      return;
    }

    setGpsLoading(true);
    setFormError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCustomerLatitude(
          position.coords.latitude
        );

        setCustomerLongitude(
          position.coords.longitude
        );

        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        setFormError(
          "تعذر الحصول على موقعك. يرجى السماح بالوصول إلى الموقع."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.unitPrice * item.quantity,
    0
  );

  const delivery =
    cart.length > 0
      ? storeConfig.deliveryFee
      : 0;
  const normalizedPromoCode =
    promoCode.trim();

  const normalizedStars =
    Math.max(
      0,
      Math.floor(
        Number(starsToUse) || 0
      )
    );

  const estimatedPromoDiscount =
    discountMethod === "promo" &&
    normalizedPromoCode.length > 0
      ? Math.round(
          subtotal * 0.20 * 100
        ) / 100
      : 0;

  const estimatedStarsDiscount =
    discountMethod === "stars"
      ? Math.min(
          delivery,
          normalizedStars * 5
        )
      : 0;

  const total =
    subtotal + delivery;

  const displayTotal =
    subtotal -
    estimatedPromoDiscount +
    delivery -
    estimatedStarsDiscount;

  const totalItems = cart.reduce(
    (total, item) =>
      total + item.quantity,
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
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="cart-modal__header">
          <div>
            <h2>سلة الطلب</h2>

            <span>
              {totalItems}{" "}
              {totalItems === 1
                ? "منتج"
                : "منتجات"}
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
            <div
              className="cart-item"
              key={item.cartId}
            >
              <img
                src={item.image}
                alt={item.name}
              />

              <div className="cart-item__info">
                <strong>{item.name}</strong>

                {item.options?.length > 0 && (
                  <small>
                    الإضافات:{" "}
                    {item.options
                      .map(
                        (option) =>
                          option.name
                      )
                      .join(" + ")}
                  </small>
                )}

                <span>
                  {formatPrice(
                    item.unitPrice
                  )}
                </span>
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
                  -
                </button>

                <strong>
                  {item.quantity}
                </strong>

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
                onClick={() =>
                  onRemove(item.cartId)
                }
              >
                حذف المنتج
              </button>
            </div>
          ))}
        </div>

        <div className="cart-customer-form">
          <label>
            الاسم الكامل

            <input
              type="text"
              value={customerName}
              onChange={(event) =>
                setCustomerName(
                  event.target.value
                )
              }
              placeholder="مثال: الاسم الكامل"
            />
          </label>

          <label>
            الهاتف / الواتساب

            <input
              type="tel"
              inputMode="tel"
              value={customerPhone}
              onChange={(event) =>
                setCustomerPhone(
                  event.target.value
                )
              }
              placeholder="0550000000"
            />
          </label>

          <div
            className="cart-discount-method"
            style={{
              marginTop: "16px",
              marginBottom: "16px",
            }}
          >
            <strong>
              اختر طريقة الخصم
            </strong>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "10px",
              }}
            >
              <input
                type="radio"
                name="discountMethod"
                value="none"
                checked={discountMethod === "none"}
                onChange={() => {
                  setDiscountMethod("none");
                  setPromoCode("");
                }}
              />
              بدون خصم
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "10px",
              }}
            >
              <input
                type="radio"
                name="discountMethod"
                value="promo"
                checked={discountMethod === "promo"}
                onChange={() =>
                  setDiscountMethod("promo")
                }
              />
              🎟️ كود Promo
            </label>

            {discountMethod === "promo" && (
              <div style={{ marginTop: "10px" }}>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(event) =>
                    setPromoCode(
                      event.target.value.toUpperCase()
                    )
                  }
                  placeholder="مثال: 123ABC@"
                  autoCapitalize="characters"
