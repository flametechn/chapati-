import { useEffect, useState } from "react";
import {
  storeConfig,
  menuGroups,
  heroImage,
  themes,
  sauces,
} from "./config.js";
import "./App.css";
import { supabase } from "./supabase.js";
import { playClickSound, playSwipeSound } from "./sound.js";
import OwnerDashboard from "./OwnerDashboard.jsx";
import DriverDashboard from "./DriverDashboard.jsx";

function waLink(text) {
  const base = `https://wa.me/${storeConfig.whatsappNumber}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

function formatPrice(value) {
  return `${value.toLocaleString("fr-DZ")} ??`;
}

/* =========================================================
   PRODUCT CARD
   ========================================================= */

function StoryCard({ item, onAdd, allowQuantity }) {
  const theme = themes[item.theme] || themes.violet;
  const [quantity, setQuantity] = useState(1);

  function handleAdd() {
    onAdd(item, quantity);
    setQuantity(1);
  }

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

      {allowQuantity && (
        <div className="story-card__qty">
          <button
            type="button"
            onClick={() =>
              setQuantity((q) => Math.max(1, q - 1))
            }
            aria-label={`????? ???? ${item.name}`}
          >
            -
          </button>

          <strong>{quantity}</strong>

          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label={`????? ???? ${item.name}`}
          >
            +
          </button>
        </div>
      )}

      <button
        type="button"
        className="story-card__order"
        onClick={handleAdd}
      >
        ??? ??? ?????
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

  const [quantity, setQuantity] = useState(
    item.initialQuantity || 1
  );

  const detectedFilling =
    item.name?.includes("??????")
      ? "??????"
      : item.name?.includes("????")
        ? "????"
        : item.name?.includes("????")
          ? "????"
          : null;

  const defaultType =
    ["??????", "????", "????"].includes(item.type)
      ? item.type
      : detectedFilling || "??????";

  const [type, setType] = useState(defaultType);

  const [specialChoice, setSpecialChoice] =
    useState("cheese");

  const [sauce, setSauce] = useState(["mayonnaise"]);

  const [extraFilling, setExtraFilling] =
    useState(false);

  const [freeExtras, setFreeExtras] = useState([]);

  const basePrice = isChapatiSpecial
    ? 250
    : isMalfoufSpecial
      ? 300
      : item.price;

  const fillingType = isSpecial
    ? ["??????", "????", "????"].includes(type)
      ? type
      : detectedFilling
    : detectedFilling;

  let unitPrice = basePrice;

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

  if (isSpecial) {
    if (isChapatiSpecial) {
      selectedOptions.push({
        id: "type",
        name: `?????: ${type}`,
        price: 0,
      });
    }

    selectedOptions.push({
      id: specialChoice,
      name:
        specialChoice === "cheese"
          ? "????"
          : "???????",
      price:
        specialChoice === "cheese"
          ? 0
          : 50,
    });
  }

  if (extraFilling && fillingType) {
    selectedOptions.push({
      id:
        fillingType === "??????"
          ? "extra-scalope"
          : fillingType === "????"
            ? "extra-kebda"
            : "extra-mix",
      name: `????? ${fillingType}`,
      price: 50,
    });
  }

  const freeExtraOptions = [
    {
      id: "onion",
      name: "???",
    },
    {
      id: "dabcha",
      name: "????",
    },
    {
      id: "pepper",
      name: "????",
    },
  ];

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
        aria-label={`?????? ?????? ${item.name}`}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="product-options__header">
          <div>
            <h2>{item.name}</h2>

            <p>
              ???? ???????? ???? ??????
            </p>
          </div>

          <button
            type="button"
            className="cart-modal__close"
            onClick={onClose}
            aria-label="????? ???????"
          >
            �
          </button>
        </div>

        {isSpecial && (
          <>
            {isChapatiSpecial && (
              <div className="product-options__section">
                <h3>??? ??????</h3>

                <div className="product-options__choices">
                  {[
                    "??????",
                    "????",
                    "????",
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
              <h3>??????? ??????</h3>

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
                    ???? � {formatPrice(50)}
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
                    ??????? � {formatPrice(100)}
                  </span>
                </label>
              </div>
            </div>
          </>
        )}

        {fillingType && (
          <div className="product-options__section">
            <h3>????? ??????</h3>

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
                  ????? {fillingType} +50 ??
                </span>
              </label>
            </div>
          </div>
        )}

        {fillingType && (
          <div className="product-options__section">
            <h3>?????? ??????</h3>

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
                        {option.name} ?????
                      </span>
                    </label>
                  );
                }
              )}
            </div>
          </div>
        )}

        <div className="product-options__section">
          <h3>??????</h3>

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
              aria-label="????? ??????"
            >
              -
            </button>

            <strong>{quantity}</strong>

            <button
              type="button"
              onClick={() =>
                setQuantity((q) => q + 1)
              }
              aria-label="????? ??????"
            >
              +
            </button>
          </div>

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

/* =========================================================
   CART
   ========================================================= */

function CartModal({
  cart,
  customer,
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

  const [formError, setFormError] =
    useState("");

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.unitPrice * item.quantity,
    0
  );

  const delivery =
    cart.length > 0
      ? storeConfig.deliveryFee
      : 0;

  const total = subtotal + delivery;

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
        aria-label="??? ?????"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="cart-modal__header">
          <div>
            <h2>??? ?????</h2>

            <span>
              {totalItems}{" "}
              {totalItems === 1
                ? "????"
                : "??????"}
            </span>
          </div>

          <button
            type="button"
            className="cart-modal__close"
            onClick={onClose}
            aria-label="????? ?????"
          >
            �
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
                    ????????:{" "}
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
                  aria-label={`????? ???? ${item.name}`}
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
                  aria-label={`????? ???? ${item.name}`}
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
                ??? ??????
              </button>
            </div>
          ))}
        </div>

        <div className="cart-customer-form">
          <label>
            ????? ??????

            <input
              type="text"
              value={customerName}
              onChange={(event) =>
                setCustomerName(
                  event.target.value
                )
              }
              placeholder="????: ???? ?????"
            />
          </label>

          <label>
            ??? ??????

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

          <label>
            ???? / ???????

            <input
              type="text"
              value={customerAddress}
              onChange={(event) =>
                setCustomerAddress(
                  event.target.value
                )
              }
              placeholder="????: ?? ?????? ??????"
            />
          </label>

          {formError && (
            <small className="cart-customer-form__error">
              {formError}
            </small>
          )}
        </div>

        <div className="cart-summary">
          <div>
            <span>
              ????? ????????
            </span>

            <strong>
              {formatPrice(subtotal)}
            </strong>
          </div>

          <div>
            <span>
              ?????? ???????
            </span>

            <strong>
              {formatPrice(delivery)}
            </strong>
          </div>

          <div className="cart-summary__total">
            <span>
              ??????? ???????
            </span>

            <strong>
              {formatPrice(total)}
            </strong>
          </div>
        </div>

        <button
          type="button"
          className="cart-modal__checkout"
          onClick={() => {
            if (
              customerName.trim().length < 2 ||
              customerPhone.trim().length < 8 ||
              customerAddress.trim().length < 3
            ) {
              setFormError(
                "???? ????? ????? ???? ?????? ???????? ??????."
              );
              return;
            }

            setFormError("");

            onCheckout({
              subtotal,
              delivery,
              total,
              customerName:
                customerName.trim(),
              customerPhone:
                customerPhone.trim(),
              customerAddress:
                customerAddress.trim(),
            });
          }}
        >
          ????? ????? ??? ??????
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN APP
   ========================================================= */

export default function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] =
    useState(false);

  const [selectedItem, setSelectedItem] =
    useState(null);

  /* =====================================================
     CUSTOMER AUTH
     ===================================================== */

  const [customer, setCustomer] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "chapati_customer"
          );

        return saved
          ? JSON.parse(saved)
          : null;
      } catch {
        return null;
      }
    });

  const [
    isCustomerLoginOpen,
    setIsCustomerLoginOpen,
  ] = useState(false);

  const [
    customerPhoneInput,
    setCustomerPhoneInput,
  ] = useState("");

  const [
    customerNameInput,
    setCustomerNameInput,
  ] = useState("");

  const [
    customerLoginLoading,
    setCustomerLoginLoading,
  ] = useState(false);

  const [
    customerLoginError,
    setCustomerLoginError,
  ] = useState("");

  /* =====================================================
     UNIFIED AUTH
     OWNER + DRIVER
     ===================================================== */

  const [
    isAuthLoginOpen,
    setIsAuthLoginOpen,
  ] = useState(false);

  const [
    authPhoneInput,
    setAuthPhoneInput,
  ] = useState("");

  const [
    authPasswordInput,
    setAuthPasswordInput,
  ] = useState("");

  const [
    authLoginLoading,
    setAuthLoginLoading,
  ] = useState(false);

  const [
    authLoginError,
    setAuthLoginError,
  ] = useState("");

  const [authUser, setAuthUser] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "chapati_auth_user"
          );

        if (!saved) return null;

        const parsed =
          JSON.parse(saved);

        return parsed?.role === "owner" ||
          parsed?.role === "driver"
          ? parsed
          : null;
      } catch {
        return null;
      }
    });

  const [authStep, setAuthStep] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "chapati_auth_user"
          );

        if (!saved) return "login";

        const parsed =
          JSON.parse(saved);

        return parsed?.role === "owner" ||
          parsed?.role === "driver"
          ? "dashboard"
          : "login";
      } catch {
        return "login";
      }
    });

  const [
    authSessionToken,
    setAuthSessionToken,
  ] = useState(() => {
    try {
      return (
        localStorage.getItem(
          "chapati_driver_session_token"
        ) || ""
      );
    } catch {
      return "";
    }
  });

  const [authPhoneError, setAuthPhoneError] =
    useState("");

  const [
    authSavePhoneLoading,
    setAuthSavePhoneLoading,
  ] = useState(false);

  const [
    ownerOrdersToday,
    setOwnerOrdersToday,
  ] = useState(null);

  const [
    ownerOrdersLoading,
    setOwnerOrdersLoading,
  ] = useState(false);

  /* =====================================================
     CLICK SOUND
     ===================================================== */

  useEffect(() => {
    function handleClickSound(event) {
      const target =
        event.target.closest("button, a");

      if (target) {
        playClickSound();
      }
    }

    document.addEventListener(
      "click",
      handleClickSound,
      true
    );

    return () =>
      document.removeEventListener(
        "click",
        handleClickSound,
        true
      );
  }, []);

  /* =====================================================
     SWIPE SOUND
     ===================================================== */

  useEffect(() => {
    const strips =
      document.querySelectorAll(
        ".menu-group__strip"
      );

    let lastPlay = 0;

    function handleSwipeSound() {
      const now = Date.now();

      if (now - lastPlay > 220) {
        lastPlay = now;
        playSwipeSound();
      }
    }

    strips.forEach((strip) =>
      strip.addEventListener(
        "scroll",
        handleSwipeSound,
        { passive: true }
      )
    );

    return () =>
      strips.forEach((strip) =>
        strip.removeEventListener(
          "scroll",
          handleSwipeSound
        )
      );
  }, [authUser]);

  /* =====================================================
     CUSTOMER FUNCTIONS
     ===================================================== */

  async function loginCustomer(event) {
    event.preventDefault();

    setCustomerLoginError("");

    const phone =
      customerPhoneInput.trim();

    const name =
      customerNameInput.trim();

    if (phone.length < 8) {
      setCustomerLoginError(
        "???? ????? ??? ???? ????."
      );
      return;
    }

    if (name.length < 2) {
      setCustomerLoginError(
        "???? ????? ?????."
      );
      return;
    }

    if (!supabase) {
      setCustomerLoginError(
        "???? ????? ?????? ??? ????? ??????."
      );
      return;
    }

    setCustomerLoginLoading(true);

    const { data, error } =
      await supabase.rpc(
        "customer_login",
        {
          p_phone: phone,
          p_name: name,
        }
      );

    setCustomerLoginLoading(false);

    if (error || !data?.success) {
      setCustomerLoginError(
        data?.message ||
          "???? ????? ??????. ???? ??? ????."
      );
      return;
    }

    const loggedCustomer = {
      id: data.customer_id,
      phone: data.phone,
      name: data.name,
    };

    setCustomer(loggedCustomer);

    localStorage.setItem(
      "chapati_customer",
      JSON.stringify(loggedCustomer)
    );

    setCustomerPhoneInput("");
    setCustomerNameInput("");
    setCustomerLoginError("");
    setIsCustomerLoginOpen(false);
  }

  function logoutCustomer() {
    setCustomer(null);

    localStorage.removeItem(
      "chapati_customer"
    );
  }

  function openCustomerSignup() {
    setCustomerLoginError("");

    if (customer) {
      setCustomerPhoneInput(
        customer.phone || ""
      );

      setCustomerNameInput(
        customer.name || ""
      );
    } else {
      setCustomerPhoneInput("");
      setCustomerNameInput("");
    }

    setIsCustomerLoginOpen(true);
  }

  /* =====================================================
     UNIFIED AUTH FUNCTIONS
     ===================================================== */

  function openAuthLogin() {
    setAuthLoginError("");
    setAuthPhoneError("");
    setAuthPhoneInput("");
    setAuthPasswordInput("");

    if (
      authUser?.role === "owner" ||
      authUser?.role === "driver"
    ) {
      setAuthStep("dashboard");
    } else {
      setAuthStep("login");
    }

    setIsAuthLoginOpen(true);

    if (authUser?.role === "owner") {
      loadOwnerOrders();
    }
  }

  async function loginUnified(event) {
    event.preventDefault();

    setAuthLoginError("");

    const phone =
      authPhoneInput.trim();

    const password =
      authPasswordInput;

    if (!/^0[5-7][0-9]{8}$/.test(phone)) {
      setAuthLoginError(
        "???? ????? ??? ???? ?????? ???? ??? 0550000000."
      );
      return;
    }

    if (!password) {
      setAuthLoginError(
        "???? ????? ???? ??????."
      );
      return;
    }

    if (!supabase) {
      setAuthLoginError(
        "???? ????? ?????? ??? ????? ??????."
      );
      return;
    }

    setAuthLoginLoading(true);

    const { data, error } =
      await supabase.rpc(
        "unified_login",
        {
          p_identifier: phone,
          p_password: password,
        }
      );

    setAuthLoginLoading(false);

    if (error) {
      console.error(
        "Unified login RPC error:",
        error
      );

      setAuthLoginError(
        "???? ??????? ????? ????? ??????."
      );

      return;
    }

    const result = data || {};

    if (!result.success) {
      setAuthLoginError(
        result.message ||
          "??? ?????? ?? ???? ?????? ??? ?????."
      );

      return;
    }

    if (
      result.role !== "owner" &&
      result.role !== "driver"
    ) {
      setAuthLoginError(
        "??? ?????? ?? ???? ?????? ?????? ??? ??? ???????."
      );

      return;
    }

    const account =
      result.driver ||
      result.owner ||
      result.user ||
      {};

    const id =
      account.id ||
      result.driver_id ||
      result.owner_id ||
      result.user_id ||
      result.id;

    const name =
      account.name ||
      result.driver_name ||
      result.owner_name ||
      result.user_name ||
      result.name ||
      "";

    const returnedPhone =
      account.phone ||
      result.driver_phone ||
      result.owner_phone ||
      result.phone ||
      phone;

    const sessionToken =
      result.session_token || "";

    if (!id) {
      setAuthLoginError(
        "???? ????? ??????."
      );

      return;
    }

    const loggedUser = {
      id,
      name:
        name ||
        (result.role === "owner"
          ? "??????"
          : "??????"),
      phone: returnedPhone,
      role: result.role,
    };

    setAuthUser(loggedUser);

    localStorage.setItem(
      "chapati_auth_user",
      JSON.stringify(loggedUser)
    );

    setAuthSessionToken(sessionToken);

    if (sessionToken) {
      localStorage.setItem(
        "chapati_driver_session_token",
        sessionToken
      );
    }

    setAuthPhoneInput("");
    setAuthPasswordInput("");
    setAuthLoginError("");

    if (
      result.role === "driver" &&
      !returnedPhone
    ) {
      setAuthPhoneInput("");
      setAuthPhoneError("");
      setAuthStep("phone");
      return;
    }

    setAuthStep("dashboard");

    if (result.role === "owner") {
      loadOwnerOrders();
    }
  }

  async function loadOwnerOrders() {
    if (!supabase) return;

    setOwnerOrdersLoading(true);

    const { data, error } =
      await supabase.rpc(
        "get_orders_today_count"
      );

    setOwnerOrdersLoading(false);

    if (error || !data?.success) {
      console.error(
        "Owner orders count error:",
        error
      );

      setOwnerOrdersToday(null);

      return;
    }

    setOwnerOrdersToday(data.count);
  }

  async function saveAuthDriverPhone(event) {
    event.preventDefault();

    setAuthPhoneError("");

    const phone =
      authPhoneInput.trim();

    if (!/^0[5-7][0-9]{8}$/.test(phone)) {
      setAuthPhoneError(
        "???? ????? ??? ???? ?????? ???? ??? 0550000000."
      );
      return;
    }

    if (
      !authUser?.id ||
      authUser.role !== "driver"
    ) {
      setAuthPhoneError(
        "???? ?????? ??? ?????. ??? ????? ??????."
      );
      return;
    }

    if (!authSessionToken) {
      setAuthPhoneError(
        "???? ?????? ??????. ??? ????? ??????."
      );
      return;
    }

    if (!supabase) {
      setAuthPhoneError(
        "???? ?????? ??? ????? ??????."
      );
      return;
    }

    setAuthSavePhoneLoading(true);

    const { data, error } =
      await supabase.rpc(
        "set_driver_phone",
        {
          p_driver_id: authUser.id,
          p_session_token:
            authSessionToken,
          p_phone: phone,
        }
      );

    setAuthSavePhoneLoading(false);

    if (error) {
      console.error(
        "set_driver_phone RPC error:",
        error
      );

      setAuthPhoneError(
        "???? ??? ??? ??????."
      );

      return;
    }

    if (!data?.success) {
      setAuthPhoneError(
        data?.message ||
          "???? ??? ??? ??????."
      );

      return;
    }

    const updatedUser = {
      ...authUser,
      phone,
    };

    setAuthUser(updatedUser);

    localStorage.setItem(
      "chapati_auth_user",
      JSON.stringify(updatedUser)
    );

    setAuthPhoneInput("");
    setAuthPhoneError("");
    setAuthStep("dashboard");
  }

  function logoutUnified() {
    setAuthUser(null);
    setAuthStep("login");
    setAuthSessionToken("");

    localStorage.removeItem(
      "chapati_auth_user"
    );

    localStorage.removeItem(
      "chapati_driver_session_token"
    );

    setAuthPhoneInput("");
    setAuthPasswordInput("");
    setAuthLoginError("");
    setAuthPhoneError("");
    setOwnerOrdersToday(null);
    setIsAuthLoginOpen(false);
  }

  /* =====================================================
     CART
     ===================================================== */

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
        unitPrice:
          item.unitPrice ?? item.price,
        quantity:
          item.quantity ?? 1,
      },
    ]);

    setSelectedItem(null);
    setIsCartOpen(true);
  }

  function addToCart(
    item,
    quantity = 1
  ) {
    if (item.customization) {
      setSelectedItem({
        ...item,
        initialQuantity: quantity,
      });

      return;
    }

    addConfiguredItem({
      ...item,
      quantity,
    });
  }

  function updateQuantity(
    cartId,
    quantity
  ) {
    if (quantity <= 0) {
      setCart((currentCart) =>
        currentCart.filter(
          (item) =>
            item.cartId !== cartId
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
        (item) =>
          item.cartId !== cartId
      )
    );
  }

  async function checkoutOrder({
    subtotal,
    delivery,
    total,
    customerName,
    customerPhone,
    customerAddress,
  }) {
    if (cart.length === 0) return;

    const orderItems = cart.map(
      (item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        options: item.options || [],
      })
    );

    if (supabase) {
      await supabase.rpc(
        "create_order",
        {
          p_customer_name:
            customerName,
          p_customer_phone:
            customerPhone,
          p_customer_address:
            customerAddress,
          p_items: orderItems,
          p_total: total,
          p_delivery_fee: delivery,
          p_customer_id:
            customer?.id || null,
        }
      );
    }

    const lines = cart.map(
      (item, index) => {
        const options =
          item.options?.length > 0
            ? `\n   ????????: ${item.options
                .map(
                  (option) =>
                    option.name
                )
                .join(" + ")}`
            : "";

        return `${index + 1}. ${
          item.name
        } ? ${
          item.quantity
        } ? ${formatPrice(
          item.unitPrice *
            item.quantity
        )}${options}`;
      }
    );

    const message = [
      `?????: ${customerName}`,
      `??????: ${customerPhone}`,
      `???????: ${customerAddress}`,
      "",
      `?????? ?????? ???? ?? ??? ?? ${storeConfig.name}`,
      "",
      "?????? ?????:",
      ...lines,
      "",
      `????? ????????: ${formatPrice(
        subtotal
      )}`,
      `?????? ???????: ${formatPrice(
        delivery
      )}`,
      `??????? ???????: ${formatPrice(
        total
      )}`,
      "",
      "???? ????? ?????.",
    ].join("\n");

    window.open(
      waLink(message),
      "_blank",
      "noopener,noreferrer"
    );
  }

  const totalItems = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      item.unitPrice *
        item.quantity,
    0
  );

  /* =====================================================
     ROLE CHECK
     ===================================================== */

  const isStaff =
    authUser?.role === "owner" ||
    authUser?.role === "driver";

  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <>
      <style>{`
        /* =================================================
           GLOW 2 PRODUCT EFFECT
           ================================================= */
        .glow2-product {
          position: relative;
          isolation: isolate;
          overflow: visible;
          transform: translateZ(0);
        }

        /* ?????? ???????? */
        .glow2-product__light {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 110%;
          height: 110%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(255,255,255,1) 0%,
              rgba(255,230,150,.95) 12%,
              rgba(255,170,55,.75) 28%,
              rgba(255,100,20,.38) 48%,
              rgba(255,60,0,0) 72%
            );
          filter: blur(25px);
          opacity: .9;
          z-index: -2;
          pointer-events: none;
          animation: glow2Pulse 2.2s ease-in-out infinite;
        }

        /* ???? ???? ????? */
        .glow2-product::before {
          content: "";
          position: absolute;
          inset: -18%;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(255,255,255,.65) 0%,
              rgba(255,180,70,.45) 25%,
              rgba(255,80,20,.18) 48%,
              transparent 72%
            );
          filter: blur(30px);
          opacity: .85;
          z-index: -3;
          pointer-events: none;
          animation: glow2Aura 3s ease-in-out infinite;
        }

        /* ????? ??? ??? ?????? */
        .glow2-product::after {
          content: "";
          position: absolute;
          top: -15%;
          left: -80%;
          width: 45%;
          height: 130%;
          transform: rotate(20deg);
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0) 20%,
            rgba(255,255,255,.85) 50%,
            rgba(255,255,255,0) 80%,
            transparent 100%
          );
          filter: blur(8px);
          opacity: 0;
          z-index: 4;
          pointer-events: none;
          animation: glow2Shine 3.5s ease-in-out infinite;
        }

        /* ???? ?????? */
        .glow2-product .story-card__img {
          position: relative;
          z-index: 2;
          transform: translateZ(0);
          filter:
            drop-shadow(0 12px 18px rgba(0,0,0,.20))
            drop-shadow(0 0 10px rgba(255,255,255,.35))
            drop-shadow(0 0 28px rgba(255,145,45,.55));
          transition:
            transform .35s ease,
            filter .35s ease;
        }

        /* ??? ????? ?????? */
        .story-card:hover .glow2-product .story-card__img {
          transform: scale(1.06) translateY(-5px);
          filter:
            drop-shadow(0 18px 24px rgba(0,0,0,.22))
            drop-shadow(0 0 16px rgba(255,255,255,.65))
            drop-shadow(0 0 38px rgba(255,145,45,.85));
        }

        /* ??? ?? Glow */
        @keyframes glow2Pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(.88);
            opacity: .65;
          }

          50% {
            transform: translate(-50%, -50%) scale(1.12);
            opacity: 1;
          }
        }

        /* ???? ?????? ???????? */
        @keyframes glow2Aura {
          0%, 100% {
            transform: scale(.92);
            opacity: .55;
          }

          50% {
            transform: scale(1.08);
            opacity: .95;
          }
        }

        /* ???? ?????? */
        @keyframes glow2Shine {
          0% {
            left: -80%;
            opacity: 0;
          }

          15% {
            opacity: .9;
          }

          45% {
            left: 135%;
            opacity: .9;
          }

          55%, 100% {
            left: 135%;
            opacity: 0;
          }
        }


          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.08);
          }
        }

        /* =================================================
           STAFF MODE
           ================================================= */

        body.staff-mode .hero,
        body.staff-mode .story,
        body.staff-mode .site-footer {
          display: none;
        }

        /* =================================================
           CART
           ================================================= */

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

        /* =================================================
           PRODUCT OPTIONS
           ================================================= */

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

        /* =================================================
           HEADER
           ================================================= */

        .site-header__actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .site-header__customer {
          min-height: 42px;
          padding: 0 14px;
          border: 1px solid rgba(255,255,255,.2);
          border-radius: 12px;
          background: rgba(255,255,255,.08);
          color: inherit;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .site-header__customer:hover {
          background: rgba(255,255,255,.14);
        }

        /* =================================================
           LOGIN
           ================================================= */

        .customer-login-backdrop,
        .driver-login-backdrop {
          position: fixed;
          inset: 0;
          z-index: 4000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(0,0,0,.6);
        }

        .customer-login-modal,
        .driver-login-modal {
          width: min(100%, 440px);
          direction: rtl;
          border-radius: 24px;
          background: #fff;
          color: #17120f;
          box-shadow: 0 24px 70px rgba(0,0,0,.35);
          padding: 22px;
        }

        .driver-login-modal {
          width: min(100%, 460px);
        }

        .customer-login__header,
        .driver-login__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 20px;
        }

        .customer-login__header h2,
        .driver-login__header h2 {
          margin: 0;
          font-size: 22px;
        }

        .customer-login__header p,
        .driver-login__header p {
          margin: 6px 0 0;
          color: #777;
          font-size: 13px;
          line-height: 1.6;
        }

        .customer-login__form,
        .driver-login__form {
          display: grid;
          gap: 12px;
        }

        .customer-login__form label,
        .driver-login__form label {
          display: grid;
          gap: 7px;
          font-weight: 700;
          font-size: 14px;
        }

        .customer-login__form input,
        .driver-login__form input {
          width: 100%;
          min-height: 48px;
          box-sizing: border-box;
          border: 1px solid #ddd;
          border-radius: 13px;
          padding: 0 13px;
          background: #fafafa;
          color: #17120f;
          font: inherit;
          outline: none;
        }

        .customer-login__form input:focus,
        .driver-login__form input:focus {
          border-color: #e8622c;
          box-shadow: 0 0 0 3px rgba(232,98,44,.12);
        }

        .customer-login__error,
        .driver-login__error {
          display: block;
          padding: 10px 12px;
          border-radius: 11px;
          background: #fff0f0;
          color: #b8202c;
          font-size: 13px;
          line-height: 1.5;
        }

        .driver-login__success {
          padding: 12px;
          border-radius: 12px;
          background: #eefaf2;
          color: #176c38;
          line-height: 1.7;
          font-size: 14px;
        }

        .driver-login__info {
          margin-bottom: 14px;
          padding: 12px;
          border-radius: 12px;
          background: #f7f7f7;
          line-height: 1.8;
          font-size: 14px;
        }

        .driver-login__info strong {
          color: #e8622c;
        }

        .driver-login__submit {
          width: 100%;
          min-height: 50px;
          margin-top: 4px;
          border: 0;
          border-radius: 14px;
          background: #e8622c;
          color: #fff;
          font: inherit;
          font-weight: 800;
          cursor: pointer;
        }

        .driver-login__submit:disabled {
          opacity: .65;
          cursor: wait;
        }

        .driver-login__logout {
          width: 100%;
          min-height: 46px;
          margin-top: 10px;
          border: 1px solid #ddd;
          border-radius: 13px;
          background: #fff;
          color: #b8202c;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }

        .driver-dashboard {
          text-align: center;
        }

        .driver-dashboard__icon {
          width: 76px;
          height: 76px;
          display: grid;
          place-items: center;
          margin: 0 auto 14px;
          border-radius: 50%;
          background: #fff1e9;
          font-size: 36px;
        }

        .driver-dashboard h3 {
          margin: 0;
          font-size: 22px;
        }

        .driver-dashboard__phone {
          margin: 8px 0 18px;
          color: #666;
        }

        .driver-dashboard__status {
          padding: 12px;
          border-radius: 13px;
          background: #eefaf2;
          color: #176c38;
          font-weight: 700;
          margin-bottom: 14px;
        }

        /* =================================================
           CUSTOMER FORM
           ================================================= */

        .cart-customer-form {
          display: grid;
          gap: 10px;
          margin: 14px 0;
        }

        .cart-customer-form label {
          display: grid;
          gap: 6px;
          font-weight: 700;
          font-size: 13px;
        }

        .cart-customer-form input {
          min-height: 44px;
          border-radius: 12px;
          border: 1px solid #ddd;
          padding: 0 12px;
          font: inherit;
        }

        .cart-customer-form__error {
          color: #a52323;
        }

        .customer-login__submit {
          width: 100%;
          min-height: 50px;
          margin-top: 4px;
          border: 0;
          border-radius: 14px;
          background: #e8622c;
          color: #fff;
          font: inherit;
          font-weight: 800;
          cursor: pointer;
        }

        .customer-login__logout {
          width: 100%;
          min-height: 46px;
          margin-top: 10px;
          border: 1px solid #ddd;
          border-radius: 13px;
          background: #fff;
          color: #b8202c;
          font: inherit;
          font-weight: 700;
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

          .product-options__footer > strong {
            text-align: center;
          }
        }

        @media (max-width: 520px) {
          .site-header__actions {
            gap: 6px;
          }

          .site-header__customer {
            max-width: 125px;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 0 10px;
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

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="site-header">
        <span className="site-header__name">
          {storeConfig.name}
        </span>

        <div className="site-header__actions">
          <button
            type="button"
            className="site-header__customer"
            onClick={openCustomerSignup}
          >
            {customer
              ? "?????"
              : "????? ????"}
          </button>

          <button
            type="button"
            className="site-header__customer"
            onClick={openAuthLogin}
          >
            {authUser
              ? `?? ${authUser.name}`
              : "????? ??????"}
          </button>

          <button
            type="button"
            className="site-header__cta"
            onClick={() =>
              setIsCartOpen(true)
            }
          >
            ?????{" "}
            {totalItems > 0 &&
              `(${totalItems})`}
          </button>
        </div>
      </header>

      {/* =====================================================
          HERO
          ===================================================== */}

      {!isStaff && (
        <>
          <section className="hero">
            <div
              className="hero__pattern"
              style={{
                backgroundImage: `url(${import.meta.env.BASE_URL}videos/t%C3%A9l%C3%A9charger.webp)`,
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

              <p className="hero__tagline balance chapati-caption">
                {storeConfig.tagline}
              </p>

              <button
                type="button"
                className="hero__cta"
                onClick={() =>
                  document
                    .getElementById(
                      "chapati-normal"
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                ???? ???? ????
              </button>
            </div>

            <div
              className="hero__tear"
              aria-hidden="true"
            ></div>
          </section>
        </>
      )}

      {/* =====================================================
          PRODUCTS
          IMPORTANT:
          OWNER + DRIVER DO NOT SEE PRODUCTS
          CUSTOMER + VISITOR SEE PRODUCTS
          ===================================================== */}

      {!isStaff && (
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
                {group.items.map(
                  (item) => (
                    <StoryCard
                      item={item}
                      key={item.id}
                      onAdd={addToCart}
                      allowQuantity={
                        group.id !==
                        "drinks"
                      }
                    />
                  )
                )}
              </div>
            </section>
          ))}
        </main>
      )}

      {/* =====================================================
          STORY
          ===================================================== */}

      {!isStaff && (
        <section className="story">
          <p className="story__text balance">
            ??? ????? ?? ????? ?????? ???
            ?????? ???????? ?????? ?????
            ???? ????? ??? ???? ???? ??????
            ???????.
          </p>
        </section>
      )}

      {/* =====================================================
          FOOTER
          ===================================================== */}

      {!isStaff && (
        <footer
          className="site-footer"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.65)), url(${import.meta.env.BASE_URL}videos/%D9%87.webp)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="site-footer__info">
            <span>
              {storeConfig.address}
            </span>

            <span
              className="site-footer__dot"
              aria-hidden="true"
            ></span>

            <span>
              {storeConfig.hours}
            </span>
          </div>

          <button
            type="button"
            className="site-footer__cta"
            onClick={() =>
              setIsCartOpen(true)
            }
          >
            {cart.length > 0
              ? "?????? ?????"
              : "??? ?????"}
          </button>
        </footer>
      )}

      {/* =====================================================
          CUSTOMER SIGNUP
          ===================================================== */}

      {isCustomerLoginOpen && (
        <div
          className="customer-login-backdrop"
          role="presentation"
          onClick={() =>
            setIsCustomerLoginOpen(false)
          }
        >
          <div
            className="customer-login-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-login-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="customer-login__header">
              <div>
                <h2 id="customer-login-title">
                  {customer
                    ? "?????"
                    : "????? ????"}
                </h2>

                <p>
                  {customer
                    ? "??????? ????? ?????? ?????? ????????? ??? ?????."
                    : "???? ????? ?????? ????? ???? ??????."}
                </p>
              </div>

              <button
                type="button"
                className="cart-modal__close"
                onClick={() =>
                  setIsCustomerLoginOpen(
                    false
                  )
                }
                aria-label="?????"
              >
                �
              </button>
            </div>

            <form
              onSubmit={loginCustomer}
              className="customer-login__form"
            >
              <label>
                ?????

                <input
                  type="text"
                  value={customerNameInput}
                  onChange={(event) =>
                    setCustomerNameInput(
                      event.target.value
                    )
                  }
                  placeholder="????: ????"
                  autoComplete="name"
                />
              </label>

              <label>
                ??? ??????

                <input
                  type="tel"
                  inputMode="tel"
                  value={customerPhoneInput}
                  onChange={(event) =>
                    setCustomerPhoneInput(
                      event.target.value
                    )
                  }
                  placeholder="0550000000"
                  autoComplete="tel"
                />
              </label>

              {customerLoginError && (
                <small className="customer-login__error">
                  {customerLoginError}
                </small>
              )}

              <button
                type="submit"
                className="customer-login__submit"
                disabled={
                  customerLoginLoading
                }
              >
                {customerLoginLoading
                  ? "???? ????? ??????..."
                  : "????? ??????"}
              </button>
            </form>

            {customer && (
              <button
                type="button"
                className="customer-login__logout"
                onClick={() => {
                  logoutCustomer();
                  setIsCustomerLoginOpen(
                    false
                  );
                }}
              >
                ????? ??????
              </button>
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          UNIFIED AUTH
          OWNER + DRIVER
          ===================================================== */}

      {isAuthLoginOpen && (
        <div
          className="driver-login-backdrop"
          role="presentation"
          onClick={() =>
            setIsAuthLoginOpen(false)
          }
        >
          <div
            className="driver-login-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-login-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="driver-login__header">
              <div>
                <h2 id="auth-login-title">
                  {authStep === "dashboard"
                    ? authUser?.role ===
                      "owner"
                      ? "?? ???? ??????"
                      : "?? ???? ??????"
                    : authStep ===
                        "phone"
                      ? "?? ??? ???? ??????"
                      : "🔐 ????? ??????"}
                </h2>

                <p>
                  {authStep === "dashboard"
                    ? "?? ????? ?????? ?????."
                    : authStep === "phone"
                      ? "???? ??? ????? ?????? ???? ??????."
                      : "???? ??? ?????? ????? ??????."}
                </p>
              </div>

              <button
                type="button"
                className="cart-modal__close"
                onClick={() =>
                  setIsAuthLoginOpen(
                    false
                  )
                }
                aria-label="?????"
              >
                �
              </button>
            </div>

            {/* LOGIN */}

            {authStep === "login" && (
              <form
                className="driver-login__form"
                onSubmit={loginUnified}
              >
                <label>
                  ??? ??????

                  <input
                    type="tel"
                    inputMode="tel"
                    value={authPhoneInput}
                    onChange={(event) =>
                      setAuthPhoneInput(
                        event.target.value
                      )
                    }
                    placeholder="0550000000"
                    autoComplete="tel"
                    autoFocus
                  />
                </label>

                <label>
                  ???? ??????

                  <input
                    type="password"
                    value={authPasswordInput}
                    onChange={(event) =>
                      setAuthPasswordInput(
                        event.target.value
                      )
                    }
                    placeholder="???? ??????"
                    autoComplete="current-password"
                  />
                </label>

                {authLoginError && (
                  <small className="driver-login__error">
                    {authLoginError}
                  </small>
                )}

                <button
                  type="submit"
                  className="driver-login__submit"
                  disabled={
                    authLoginLoading
                  }
                >
                  {authLoginLoading
                    ? "???? ??????..."
                    : "????? ??????"}
                </button>
              </form>
            )}

            {/* DRIVER PHONE */}

            {authStep === "phone" && (
              <form
                className="driver-login__form"
                onSubmit={
                  saveAuthDriverPhone
                }
              >
                <div className="driver-login__info">
                  ??????{" "}
                  <strong>
                    {authUser?.name ||
                      "??????"}
                  </strong>
                  <br />
                  ?????? ???? ???????
                  ??? ????? ??? ??????.
                </div>

                <label>
                  ??? ??????

                  <input
                    type="tel"
                    inputMode="tel"
                    value={authPhoneInput}
                    onChange={(event) =>
                      setAuthPhoneInput(
                        event.target.value
                      )
                    }
                    placeholder="0550000000"
                    autoComplete="tel"
                    autoFocus
                  />
                </label>

                {authPhoneError && (
                  <small className="driver-login__error">
                    {authPhoneError}
                  </small>
                )}

                <button
                  type="submit"
                  className="driver-login__submit"
                  disabled={
                    authSavePhoneLoading
                  }
                >
                  {authSavePhoneLoading
                    ? "???? ??? ?????..."
                    : "??? ??? ??????"}
                </button>
              </form>
            )}

            {/* DASHBOARD */}

            {authStep === "dashboard" &&
              authUser && (
                <div className="driver-dashboard">
                  <div className="driver-dashboard__icon">
                    {authUser.role ===
                    "owner"
                      ? "??"
                      : "??"}
                  </div>

                  <h3>
                    {authUser.name ||
                      (authUser.role ===
                      "owner"
                        ? "??????"
                        : "??????")}
                  </h3>

                  <p className="driver-dashboard__phone">
                    ??{" "}
                    {authUser.phone ||
                      "???? ???"}
                  </p>

                  {authUser.role ===
                    "owner" && (
                    <div className="driver-login__success">
                      <strong>
                        ?? ???? ??????
                      </strong>
                      <br />

                      {ownerOrdersLoading
                        ? "???? ????? ??? ???????..."
                        : ownerOrdersToday !==
                            null
                          ? (
                              <>
                                ??? ???????
                                ?????:{" "}
                                <strong>
                                  {
                                    ownerOrdersToday
                                  }
                                </strong>
                              </>
                            )
                          : "???? ????? ??? ???????."}
                    </div>
                  )}

                  {authUser.role ===
                    "driver" && (
                    <div className="driver-dashboard__status">
                      ? ?? ????? ????
                      ?????? ?????
                    </div>
                  )}

                  <button
                    type="button"
                    className="driver-login__logout"
                    onClick={
                      logoutUnified
                    }
                  >
                    ????? ??????
                  </button>
                </div>
              )}
          </div>
        </div>
      )}

      {/* =====================================================
          FLOATING CART
          ===================================================== */}

      {cart.length > 0 && (
        <button
          type="button"
          className="cart-floating"
          onClick={() =>
            setIsCartOpen(true)
          }
          aria-label="??? ??? ?????"
        >
          <span className="cart-floating__info">
            <span className="cart-floating__badge">
              {totalItems}
            </span>

            <span className="cart-floating__text">
              <strong>
                ??? ?????
              </strong>

              <small>
                ???? ??????? ????
              </small>
            </span>
          </span>

          <span className="cart-floating__price">
            {formatPrice(subtotal)}
          </span>
        </button>
      )}

      {/* =====================================================
          PRODUCT OPTIONS
          ===================================================== */}

      {selectedItem && (
        <ProductOptionsModal
          item={selectedItem}
          onClose={() =>
            setSelectedItem(null)
          }
          onConfirm={addConfiguredItem}
        />
      )}

      {/* =====================================================
          CART
          ===================================================== */}

      {isCartOpen && (
        <CartModal
          cart={cart}
          customer={customer}
          onClose={() =>
            setIsCartOpen(false)
          }
          onUpdateQuantity={
            updateQuantity
          }
          onRemove={removeFromCart}
          onCheckout={checkoutOrder}
        />
      )}
    </>
  );
}











