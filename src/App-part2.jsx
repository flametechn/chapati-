                  spellCheck={false}
                />

                <small>
                  إذا وصلك كود Promo من المحل، أدخله هنا للاستفادة من خصم 20% على قيمة المنتجات.
                </small>
              </div>
            )}

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
                value="stars"
                checked={discountMethod === "stars"}
                onChange={() =>
                  setDiscountMethod("stars")
                }
                disabled={
                  customer?.role !== "customer"
                }
              />
              ⭐ استعمال النجوم
            </label>

            {discountMethod === "stars" && (
              <div style={{ marginTop: "10px" }}>
                {customer?.role !== "customer" ? (
                  <small>
                    يجب تسجيل الدخول بحساب زبون لاستعمال النجوم.
                  </small>
                ) : (
                  <>
                    <small>
                      رصيدك الحالي: ⭐{" "}
                      {Number(customerPoints || 0)}
                    </small>

                    <input
                      type="number"
                      min="10"
                      step="10"
                      value={starsToUse}
                      onChange={(event) =>
                        setStarsToUse(
                          Number(event.target.value)
                        )
                      }
                      style={{
                        marginTop: "8px",
                      }}
                    />

                    <small>
                      كل نجمة = 5 دج خصم من التوصيل.
                    </small>

                    {estimatedStarsDiscount > 0 && (
                      <small
                        style={{
                          display: "block",
                          marginTop: "6px",
                        }}
                      >
                        الخصم المتوقع: -{" "}
                        {formatPrice(
                          estimatedStarsDiscount
                        )}
                      </small>
                    )}
                  </>
                )}
              </div>
            )}
          </div>


          <button
            type="button"
            className="cart-modal__gps"
            onClick={handleGetCustomerLocation}
            disabled={gpsLoading}
          >
            {gpsLoading
              ? "جاري تحديد الموقع..."
              : customerLatitude !== null &&
                customerLongitude !== null
              ? "✓ تم تحديد موقعك"
              : "📍 تحديد موقعي عبر GPS"}
          </button>
{customerLatitude !== null &&
  customerLongitude !== null && (
    <div
      className="customer-location-map"
      style={{
        marginTop: "12px",
        width: "100%",
        overflow: "hidden",
        borderRadius: "16px",
      }}
    >
      <MapContainer
        key={`${customerLatitude}-${customerLongitude}`}
        center={[customerLatitude, customerLongitude]}
        zoom={16}
        scrollWheelZoom={false}
        style={{
          height: "260px",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[customerLatitude, customerLongitude]}
        />
      </MapContainer>
    </div>
  )}

          {formError && (
            <small className="cart-customer-form__error">
              {formError}
            </small>
          )}
        </div>

        <div className="cart-summary">
          <div>
            <span>
              مجموع المنتجات
            </span>

            <strong>
              {formatPrice(subtotal)}
            </strong>
          </div>

          <div>
            <span>
              مصاريف التوصيل
            </span>

            <strong>
              {formatPrice(delivery)}
            </strong>
          </div>

          {estimatedPromoDiscount > 0 && (
            <div>
              <span>
                خصم Promo (20%)
              </span>

              <strong>
                -{formatPrice(
                  estimatedPromoDiscount
                )}
              </strong>
            </div>
          )}

          {estimatedStarsDiscount > 0 && (
            <div>
              <span>
                خصم النجوم
              </span>

              <strong>
                -{formatPrice(
                  estimatedStarsDiscount
                )}
              </strong>
            </div>
          )}

          <div className="cart-summary__total">
            <span>
              المجموع النهائي
            </span>

            <strong>
              {formatPrice(displayTotal)}
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
              customerLatitude === null ||
              customerLongitude === null
            ) {
              setFormError(
                "يرجى إدخال الاسم ورقم الهاتف وتحديد موقعك عبر GPS."
              );
              return;
            }

            setFormError("");

            onCheckout({
              subtotal,
              delivery,
              total: displayTotal,
              customerName:
                customerName.trim(),
              customerPhone:
                customerPhone.trim(),
              customerAddress:
                `GPS: ${customerLatitude}, ${customerLongitude}`,
              customerLatitude,
              customerLongitude,
              promoCode: discountMethod === "promo" ? normalizedPromoCode || null : null,
              points: discountMethod === "stars" ? normalizedStars : 0,
              sessionToken: customer?.sessionToken || null,
            });
          }}
        >
          طلب
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

  const [customerOrderTracking, setCustomerOrderTracking] = useState(null);
  const [customerOrderTrackingId, setCustomerOrderTrackingId] = useState("");
  const [customerOrderTrackingToken, setCustomerOrderTrackingToken] = useState("");
  const [customerOrderTrackingError, setCustomerOrderTrackingError] = useState("");
  const [customerOrderSuccess, setCustomerOrderSuccess] = useState(false);
  const [customerOrderResult, setCustomerOrderResult] = useState(null);
  const [isCartOpen, setIsCartOpen] =
    useState(false);

  const [selectedItem, setSelectedItem] =
    useState(null);

  const [
    productAvailability,
    setProductAvailability,
  ] = useState({});

  async function loadProductAvailability() {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("product_availability")
        .select("product_id, available");

      if (error) {
        console.error(
          "product_availability:",
          error
        );
        return;
      }

      const map = {};

      (data || []).forEach((item) => {
        map[item.product_id] = Boolean(
          item.available
        );
      });

      setProductAvailability(map);
    } catch (requestError) {
      console.error(
        "loadProductAvailability:",
        requestError
      );
    }
  }

  /* =====================================================
     PRODUCT AVAILABILITY REALTIME SUBSCRIPTION
     ===================================================== */

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    const channel = supabase
      .channel("product-availability-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "product_availability",
        },
        () => {
          loadProductAvailability();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  useEffect(() => {
    loadProductAvailability();

    function refreshAvailability() {
      loadProductAvailability();
    }

    window.addEventListener(
      "focus",
      refreshAvailability
    );

    document.addEventListener(
      "visibilitychange",
      refreshAvailability
    );

    return () => {
      window.removeEventListener(
        "focus",
        refreshAvailability
      );

      document.removeEventListener(
        "visibilitychange",
        refreshAvailability
      );
    };
  }, []);

  /* =====================================================
     UNIFIED AUTH
     OWNER + DRIVER + CUSTOMER
     ===================================================== */



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

  const [
    customerRegisterForm,
    setCustomerRegisterForm,
  ] = useState({
    name: "",
    phone: "",
    password: "",
  });

  const [
    customerRegisterLoading,
    setCustomerRegisterLoading,
  ] = useState(false);

  const [
    customerRegisterError,
    setCustomerRegisterError,
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
          parsed?.role === "driver" ||
          parsed?.role === "customer"
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

        if (
          parsed?.role === "owner" ||
          parsed?.role === "driver"
        ) {
          return "dashboard";
        }

        if (parsed?.role === "customer") {
          return "customer";
        }

        return "login";
      } catch {
        return "login";
      }
    });

  const [
    authSessionToken,
    setAuthSessionToken,
  ] = useState(() => {
    try {
      const savedUser =
        localStorage.getItem(
          "chapati_auth_user"
        );

      if (savedUser) {
        const parsed =
          JSON.parse(savedUser);

        if (parsed?.sessionToken) {
          return parsed.sessionToken;
        }
      }

      return (
        localStorage.getItem(
          "chapati_owner_session"
        ) ||
        localStorage.getItem(
          "chapati_customer_session"
        ) ||
        localStorage.getItem(
          "chapati_driver_session_token"
        ) ||
        localStorage.getItem(
          "chapati_driver_session"
        ) ||
        ""
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

  const [
    customerNotifications,
    setCustomerNotifications,
  ] = useState([]);

  const [
    customerNotificationsLoading,
    setCustomerNotificationsLoading,
  ] = useState(false);
  const [
    customerPoints,
    setCustomerPoints,
  ] = useState(0);

  const [
    customerPointsLoading,
    setCustomerPointsLoading,
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

  useEffect(() => {
    const strips = document.querySelectorAll(".menu-group__strip");
    const observers = [];

    strips.forEach((strip) => {
      const cards = strip.querySelectorAll(".story-card");
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle(
              "is-active",
              entry.intersectionRatio > 0.6
            );
          });
        },
        { root: strip, threshold: [0.6] }
      );
      cards.forEach((card) => observer.observe(card));
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [authUser]);

  /* =====================================================
     UNIFIED AUTH FUNCTIONS
     ===================================================== */
  async function loadCustomerPoints(token) {
    if (!supabase || !token) return;

    setCustomerPointsLoading(true);

    try {
      const { data, error } = await supabase.rpc(
        "customer_get_points",
        { p_session_token: token }
      );

      if (error || !data?.success) {
        console.error("customer_get_points:", error || data?.error);
        return;
      }

      setCustomerPoints(Number(data.points || 0));
    } catch (requestError) {
      console.error("customer_get_points:", requestError);
    } finally {
      setCustomerPointsLoading(false);
    }
  }


  async function loadCustomerNotifications(token) {
    if (!supabase || !token) return;

    setCustomerNotificationsLoading(true);

    try {
      const { data, error } =
        await supabase.rpc(
          "customer_get_notifications",
          {
            p_session_token: token,
          }
        );

      if (error || !data?.success) {
        console.error(
          "customer_get_notifications:",
          error || data?.error
        );
        return;
      }

      setCustomerNotifications(
        Array.isArray(data.notifications)
          ? data.notifications
          : []
      );
    } catch (requestError) {
      console.error(
        "customer_get_notifications:",
        requestError
      );
    } finally {
      setCustomerNotificationsLoading(false);
    }
  }

  useEffect(() => {
    if (
      authUser?.role === "customer" &&
      authUser?.sessionToken
    ) {
      loadCustomerNotifications(
        authUser.sessionToken
      );
      loadCustomerPoints(
        authUser.sessionToken
      );
    } else {
      setCustomerNotifications([]);
    }
  }, [
    authUser?.id,
    authUser?.role,
    authUser?.sessionToken,
  ]);

  /* =====================================================
     CUSTOMER REALTIME SUBSCRIPTION
     ===================================================== */

  useEffect(() => {
    if (
      !supabase ||
      authUser?.role !== "customer" ||
      !authUser?.sessionToken ||
      !authUser?.id
    ) {
      return undefined;
    }

    const token = authUser.sessionToken;
    const customerId = authUser.id;

    const channel = supabase
      .channel(`customer-realtime-${customerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "customer_notifications",
          filter: `customer_id=eq.${customerId}`,
        },
        (payload) => {
          if (payload?.eventType === "INSERT") {
            playNotificationSound();
          }

          loadCustomerNotifications(token);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "customer_points",
          filter: `customer_id=eq.${customerId}`,
        },
        (payload) => {
                    if (
            payload?.eventType === "INSERT" ||
            (
              payload?.eventType === "UPDATE" &&
              payload?.new?.points != null &&
              payload?.old?.points !== payload.new.points
            )
          ) {
            playPointsSound();
          }

          if (
            payload?.new &&
            payload.new.points != null
          ) {
            setCustomerPoints(
              Number(payload.new.points || 0)
            );
          } else {
            loadCustomerPoints(token);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `customer_id=eq.${customerId}`,
        },
        (payload) => {
                    if (
            payload?.eventType === "UPDATE" &&
            payload?.new?.status &&
            payload?.old?.status !== payload.new.status
          ) {
            playOrderStatusSound();
          }

          if (
            payload?.new?.id === customerOrderTrackingId &&
            customerOrderTrackingToken
          ) {
            loadCustomerOrderTracking(
              customerOrderTrackingId,
              customerOrderTrackingToken
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    authUser?.id,
    authUser?.role,
    authUser?.sessionToken,
    customerOrderTrackingId,
    customerOrderTrackingToken,
  ]);
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
    } else if (authUser?.role === "customer") {
      setAuthStep("customer");
    } else {
      setAuthStep("choice");
    }

    setIsAuthLoginOpen(true);

    if (authUser?.role === "owner") {
      loadOwnerOrders();
    }
  }

  async function loginUnified(event) {
    event.preventDefault();

    setAuthLoginError("");

    const identifier = authPhoneInput.trim();
    const password = authPasswordInput;

    const looksLikeDriverName =
      /[^\d\s()+-]/.test(identifier);

    if (!identifier) {
      setAuthLoginError(
        "يرجى إدخال رقم الهاتف أو اسم المستخدم."
      );
      return;
    }

    if (!password) {
      setAuthLoginError(
        "يرجى إدخال كلمة المرور."
      );
      return;
    }

    if (!supabase) {
      setAuthLoginError(
        "خدمة تسجيل الدخول غير متوفرة حاليًا."
      );
      return;
    }

    setAuthLoginLoading(true);

    const { data, error } = await supabase.rpc(
      "unified_login",
      {
        p_identifier: identifier,
        p_password: password,
      }
    );

    setAuthLoginLoading(false);

    if (error) {
      console.error("Unified login RPC error:", error);
      setAuthLoginError(
        "حدث خطأ أثناء تسجيل الدخول."
      );
      return;
    }

    const result = data || {};

    console.log("=== UNIFIED LOGIN RESULT ===", result);
    console.log("=== ACCOUNT NAME ===", result?.driver?.name || result?.owner?.name || result?.customer?.name || result?.user?.name);
    console.log("=== DRIVER NAME ===", result?.driver_name);


    if (!result.success) {
      setAuthLoginError(
        result.error === "invalid_credentials"
          ? looksLikeDriverName
            ? "\u0627\u0633\u0645 \u0627\u0644\u0633\u0627\u0626\u0642 \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d\u0629."
            : "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641 \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d\u0629."
          : result.message ||
            "\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062f\u062e\u0648\u0644 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d\u0629."
      );
      return;
    }

    if (
      result.role !== "owner" &&
      result.role !== "driver" &&
      result.role !== "customer"
    ) {
      setAuthLoginError(
        "نوع الحساب غير معروف."
      );
      return;
    }

    const account =
      result.owner ||
      result.driver ||
      result.customer ||
      result.user ||
      {};

    const id =
      account.id ||
      result.owner_id ||
      result.driver_id ||
      result.customer_id ||
      result.user_id ||
      result.id ||
      null;

    const name =
      account.name ||
      result.owner_name ||
      result.driver_name ||
      result.customer_name ||
      result.user_name ||
      result.name ||
      "";

    const returnedPhone =
      account.phone ||
      result.owner_phone ||
      result.driver_phone ||
      result.customer_phone ||
      result.phone ||
      identifier;

    const sessionToken = result.session_token || "";

    if (!sessionToken) {
      setAuthLoginError(
        "تعذر إنشاء جلسة الدخول."
      );
      return;
    }

    const loggedUser = {
      id,
      name,
      phone: returnedPhone,
      role: result.role,
      sessionToken,
    };

    setAuthUser(loggedUser);

    localStorage.setItem(
      "chapati_auth_user",
      JSON.stringify(loggedUser)
    );

    setAuthSessionToken(sessionToken);

    if (result.role === "owner") {
      localStorage.setItem(
        "chapati_owner_session",
        sessionToken
      );

      localStorage.removeItem(
        "chapati_driver_session"
      );

      localStorage.removeItem(
        "chapati_driver_session_token"
      );
    }
