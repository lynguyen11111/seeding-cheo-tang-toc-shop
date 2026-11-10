"use strict";
/* ============================================================================
   Seeding chéo Tăng Tốc Shop — bản public (Vercel + Supabase)
   PHẦN 1 (thuần, không chạm DOM): bộ template sinh câu gợi ý + hàm tính toán.
   Quyết định kỹ thuật (đặc tả 9.2): câu gợi ý sinh Ở CLIENT bằng JS từ bộ
   template theo ngành hàng — chi phí 0 đồng, không gọi AI trả phí. Tổ hợp
   (chào + câu hỏi + kết câu) cho ra hàng trăm câu khác nhau; hàm luôn trả
   về đúng `count` câu DUY NHẤT (tối đa 50) cho 1 bài.
   ĐƯỜNG ĐỎ: câu chỉ ở mức hỏi size / màu / giá / ship / tư vấn.
   TUYỆT ĐỐI không có câu giả làm khách đã mua hàng.
   ========================================================================== */

var SAMPLE_GREETINGS = ["", "Shop ơi! ", "Bạn ơi! ", "Cho mình hỏi chút, ", "Alo shop, ", "Hi shop, "];

var SAMPLE_ENDINGS = ["", " ạ", " shop nhé", " nha shop", " vậy ạ", " shop ơi"];

/* Câu hỏi gốc theo ngành hàng. {sp} = tên sản phẩm, {size}, {mau} được thay biến. */
var SAMPLE_CORES = {
  "thoi-trang": [
    "{sp} còn size {size} không", "{sp} có những size nào vậy", "{sp} có màu {mau} không",
    "{sp} form rộng hay ôm vậy", "Mình cao 1m6 nặng 55kg mặc {sp} size nào vừa",
    "{sp} chất vải có dày không", "{sp} giá sỉ bao nhiêu vậy", "Lấy sỉ {sp} từ mấy cái",
    "{sp} có sẵn hàng không hay phải chờ order", "Ship {sp} về tỉnh mất mấy ngày",
    "{sp} có được kiểm hàng trước khi nhận không", "{sp} có size cho người 70kg không",
    "Màu {mau} của {sp} ở ngoài có giống hình không", "{sp} giặt có bị ra màu không"
  ],
  "my-pham": [
    "{sp} dùng cho da dầu được không", "{sp} có chính hãng không shop", "{sp} hạn sử dụng tới khi nào",
    "{sp} giá sỉ bao nhiêu vậy", "Lấy sỉ {sp} từ mấy hộp", "{sp} dùng bao lâu thì thấy hiệu quả",
    "Da nhạy cảm dùng {sp} được không", "{sp} có sẵn hàng không", "Ship {sp} về tỉnh mấy ngày tới",
    "{sp} có bản mini dùng thử không", "{sp} dùng sáng hay tối là tốt nhất", "Bầu dùng {sp} được không shop",
    "{sp} có mùi thơm lắm không", "Mua {sp} có được tặng kèm gì không"
  ],
  "gia-dung": [
    "{sp} dùng có bền không shop", "{sp} có bảo hành không", "{sp} giá sỉ bao nhiêu vậy",
    "Lấy sỉ {sp} từ mấy cái", "{sp} có sẵn hàng không", "Ship {sp} về tỉnh phí bao nhiêu",
    "{sp} dùng điện 220V đúng không", "{sp} có dễ vệ sinh không", "Kích thước {sp} bao nhiêu vậy",
    "{sp} có màu {mau} không", "{sp} lắp đặt có khó không", "Mua {sp} có được kiểm hàng không",
    "{sp} dùng cho gia đình 4 người đủ không", "{sp} có phụ kiện thay thế bán kèm không"
  ],
  "thuc-pham": [
    "{sp} hạn sử dụng bao lâu vậy", "{sp} bảo quản tủ lạnh hay để ngoài được", "{sp} giá sỉ bao nhiêu vậy",
    "Lấy sỉ {sp} từ mấy kg", "{sp} có sẵn hàng mới không", "Ship {sp} đi tỉnh có sợ hư không",
    "{sp} đóng gói mấy gram một bịch", "{sp} ăn có cay lắm không", "Trẻ em ăn {sp} được không",
    "{sp} có ngọt lắm không shop", "Mua nhiều {sp} có giảm giá không", "{sp} nguồn gốc ở đâu vậy",
    "Đặt {sp} hôm nay mai có hàng không", "{sp} có bịch nhỏ dùng thử không"
  ],
  "me-va-be": [
    "{sp} cho bé mấy tháng dùng được", "{sp} có an toàn cho da bé không", "{sp} còn size {size} không",
    "{sp} có màu {mau} không", "{sp} giá sỉ bao nhiêu vậy", "Lấy sỉ {sp} từ mấy bộ",
    "Bé 10kg mặc {sp} size nào vừa", "{sp} chất vải có mềm không", "{sp} giặt máy được không",
    "Ship {sp} về tỉnh mấy ngày", "{sp} có sẵn hàng không", "{sp} có đổi size được không shop",
    "Bé gái dùng {sp} màu {mau} xinh không", "{sp} có mùi thơm nồng không"
  ],
  "chung": [
    "{sp} còn hàng không shop", "{sp} giá sỉ bao nhiêu vậy", "Lấy sỉ {sp} từ mấy cái",
    "{sp} có những màu nào vậy", "{sp} có màu {mau} không", "{sp} còn size {size} không",
    "Ship {sp} về tỉnh mất mấy ngày", "Ship {sp} phí bao nhiêu vậy", "{sp} có được kiểm hàng không",
    "Cho mình xin thêm hình thật của {sp}", "{sp} có sẵn hay phải chờ order",
    "Mua {sp} số lượng nhiều có giá tốt hơn không", "{sp} dùng có tốt không shop, tư vấn mình với",
    "Đặt {sp} hôm nay thì khi nào giao"
  ]
};

var SAMPLE_SIZES = ["S", "M", "L", "XL", "XXL"];
var SAMPLE_COLORS = ["đen", "trắng", "be", "nâu", "xanh", "hồng", "xám", "đỏ"];

function fillTemplate(text, product) {
  var size = SAMPLE_SIZES[Math.floor(Math.random() * SAMPLE_SIZES.length)];
  var color = SAMPLE_COLORS[Math.floor(Math.random() * SAMPLE_COLORS.length)];
  return text.split("{sp}").join(product || "sản phẩm này")
             .split("{size}").join(size)
             .split("{mau}").join(color);
}

/* Sinh đúng `count` câu gợi ý DUY NHẤT cho 1 bài (count <= 50 theo trần đã chốt). */
function generateSamples(product, category, count) {
  var cores = SAMPLE_CORES[category] || SAMPLE_CORES["chung"];
  var pool = new Set();
  var combos = [];
  SAMPLE_GREETINGS.forEach(function (g) {
    cores.forEach(function (c) {
      SAMPLE_ENDINGS.forEach(function (e) {
        combos.push(g + fillTemplate(c, product) + e + (g || e ? "" : "") + "?");
      });
    });
  });
  // Khử trùng + xáo trộn
  combos = Array.from(new Set(combos));
  for (var i = combos.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = combos[i]; combos[i] = combos[j]; combos[j] = tmp;
  }
  combos.forEach(function (s) { pool.add(s); });
  var result = Array.from(pool).slice(0, count);
  // Phòng hờ: nếu tổ hợp vẫn thiếu (không xảy ra với bộ mẫu hiện tại),
  // bổ sung biến thể hỏi ship theo tỉnh để đủ số lượng.
  var provinces = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Bình Dương", "Đồng Nai", "Nghệ An"];
  var k = 0;
  while (result.length < count && k < provinces.length * 4) {
    var extra = "Ship " + (product || "sản phẩm này") + " về " + provinces[k % provinces.length] + " mất mấy ngày vậy shop?";
    if (!pool.has(extra)) { pool.add(extra); result.push(extra); }
    k++;
  }
  return result.slice(0, count);
}

/* Chi phí điểm của 1 bài: 1 comment = 1 điểm. Trả về đủ/thiếu + số ngày chia tối thiểu (trần mềm 15/ngày). */
function calcCostHint(wanted, balance) {
  var cost = Math.max(0, parseInt(wanted, 10) || 0);
  return {
    cost: cost,
    enough: balance >= cost,
    daysNeeded: cost > 0 ? Math.ceil(cost / 15) : 0
  };
}

/* Số giây còn lại tới khi nút Xong mở khóa (dựa trên unlock_at server trả). */
function remainingSeconds(unlockAtIso, nowMs) {
  if (!unlockAtIso) return 0;
  var diff = Math.ceil((new Date(unlockAtIso).getTime() - nowMs) / 1000);
  return diff > 0 ? diff : 0;
}

/* Ngày hôm nay theo giờ Việt Nam, dạng YYYY-MM-DD (cho bộ đếm việc/ngày ở client). */
function todayVNString(now) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Saigon", year: "numeric", month: "2-digit", day: "2-digit" }).format(now || new Date());
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { generateSamples, calcCostHint, remainingSeconds, todayVNString, SAMPLE_CORES };
}

/* ============================================================================
   PHẦN 2: ứng dụng trình duyệt (Supabase Auth + dữ liệu + RPC).
   Mọi thao tác nhạy cảm (phân bổ, cộng điểm, ghim) đều qua RPC ở server —
   client chỉ hiển thị và gọi hàm. Khóa 25 giây do SERVER kiểm tra trong
   complete_task; client đếm ngược chỉ để hiển thị.
   ========================================================================== */
if (typeof window !== "undefined" && typeof document !== "undefined") {
(function () {
  var sb = null, session = null, myShop = null;
  var allShops = [], allNicks = [], allPosts = [], myTasks = [], myLedger = [];
  var currentView = "overview", activeNickId = null;
  var previewSamples = null, previewKey = "";
  var unlockMap = {}; // taskId -> ISO unlock_at (server trả)

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function toast(msg) { var t = $("toast"); t.textContent = msg; t.classList.remove("hidden");
    setTimeout(function () { t.classList.add("hidden"); }, 3200); }
  function myNicks() { return allNicks.filter(function (n) { return myShop && n.shop_id === myShop.id; }); }
  function shopById(id) { return allShops.filter(function (s) { return s.id === id; })[0] || {}; }
  function givenByShop(shopId) { return allNicks.filter(function (n) { return n.shop_id === shopId; })
    .reduce(function (a, n) { return a + (n.points_earned || 0); }, 0); }
  function receivedByShop(shopId) { return allPosts.filter(function (p) { return p.shop_id === shopId; })
    .reduce(function (a, p) { return a + (p.received || 0); }, 0); }
  function doneTodayByNick(nickId) { var today = todayVNString(); return myTasks.filter(function (t) {
    return t.nick_id === nickId && t.status === "done" && t.completed_at &&
      todayVNString(new Date(t.completed_at)) === today; }).length; }

  /* ---------------- khởi tạo + auth ---------------- */
  function init() {
    if (!window.APP_CONFIG || !window.APP_CONFIG.SUPABASE_URL ||
        window.APP_CONFIG.SUPABASE_URL.indexOf("YOUR-") === 0 ||
        !window.supabase || !window.supabase.createClient) {
      $("auth-view").classList.remove("hidden");
      showAuthError("Chưa cấu hình Supabase: hãy sao chép config.example.js thành config.js và điền Project URL + anon key (xem README.md).");
      return;
    }
    sb = window.supabase.createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_ANON_KEY);
    bindAuth(); bindApp();
    sb.auth.getSession().then(function (res) { session = res.data.session; afterAuth(); });
    sb.auth.onAuthStateChange(function (_e, s) { session = s; afterAuth(); });
  }

  function afterAuth() {
    if (!session) { showAuth(); return; }
    sb.from("shops").select("*").eq("owner_id", session.user.id).maybeSingle()
      .then(function (res) {
        myShop = res.data || null;
        if (myShop) { enterApp(); }
        else {
          var pending = localStorage.getItem("pendingShopName");
          if (pending) {
            sb.rpc("create_my_shop", { p_name: pending }).then(function (r) {
              localStorage.removeItem("pendingShopName");
              if (r.data && r.data.ok) { myShop = r.data.shop; enterApp(); }
              else showCreateShop();
            });
          } else showCreateShop();
        }
      });
  }

  function showAuth() {
    $("app-view").classList.add("hidden");
    $("auth-view").classList.remove("hidden");
    $("login-form").classList.remove("hidden");
    $("register-form").classList.add("hidden");
    $("create-shop-form").classList.add("hidden");
  }
  function showCreateShop() {
    $("app-view").classList.add("hidden");
    $("auth-view").classList.remove("hidden");
    $("login-form").classList.add("hidden");
    $("register-form").classList.add("hidden");
    $("create-shop-form").classList.remove("hidden");
  }
  function showAuthError(msg) { var e = $("auth-error"); e.textContent = msg; e.classList.remove("hidden"); }
  function showAuthInfo(msg) { var e = $("auth-info"); e.textContent = msg; e.classList.remove("hidden"); }
  function clearAuthMsgs() { $("auth-error").classList.add("hidden"); $("auth-info").classList.add("hidden"); }

  function bindAuth() {
    $("show-register").addEventListener("click", function (e) { e.preventDefault(); clearAuthMsgs();
      $("login-form").classList.add("hidden"); $("register-form").classList.remove("hidden"); });
    $("show-login").addEventListener("click", function (e) { e.preventDefault(); clearAuthMsgs();
      $("register-form").classList.add("hidden"); $("login-form").classList.remove("hidden"); });

    $("login-form").addEventListener("submit", function (e) {
      e.preventDefault(); clearAuthMsgs();
      sb.auth.signInWithPassword({ email: $("login-email").value.trim(), password: $("login-password").value })
        .then(function (res) { if (res.error) showAuthError(vnAuthError(res.error.message)); });
    });

    $("register-form").addEventListener("submit", function (e) {
      e.preventDefault(); clearAuthMsgs();
      var name = $("reg-shop-name").value.trim();
      localStorage.setItem("pendingShopName", name);
      sb.auth.signUp({ email: $("reg-email").value.trim(), password: $("reg-password").value })
        .then(function (res) {
          if (res.error) { showAuthError(vnAuthError(res.error.message)); return; }
          if (!res.data.session) {
            showAuthInfo("Đăng ký xong! Nếu email yêu cầu xác nhận, hãy bấm link trong hộp thư rồi quay lại Đăng nhập — shop '" + name + "' sẽ được tạo tự động. (Admin có thể tắt xác nhận email trong Supabase để vào thẳng — xem README.)");
            $("register-form").classList.add("hidden"); $("login-form").classList.remove("hidden");
          }
          // Có session -> onAuthStateChange -> afterAuth() tự tạo shop từ pendingShopName.
        });
    });

    $("create-shop-form").addEventListener("submit", function (e) {
      e.preventDefault(); clearAuthMsgs();
      sb.rpc("create_my_shop", { p_name: $("create-shop-name").value.trim() }).then(function (r) {
        if (r.data && r.data.ok) { myShop = r.data.shop; enterApp(); }
        else showAuthError("Tạo shop chưa được, thử lại nhé.");
      });
    });
  }

  function vnAuthError(msg) {
    if (/Invalid login credentials/i.test(msg)) return "Sai email hoặc mật khẩu.";
    if (/already registered/i.test(msg)) return "Email này đã đăng ký rồi — hãy Đăng nhập.";
    if (/Password should be/i.test(msg)) return "Mật khẩu phải có tối thiểu 6 ký tự.";
    return msg;
  }

  /* ---------------- vào app + tải dữ liệu ---------------- */
  function enterApp() {
    $("auth-view").classList.add("hidden");
    $("app-view").classList.remove("hidden");
    sb.rpc("run_distribution").then(function () { loadAll(); });
  }

  function loadAll() {
    if (!myShop) return;
    Promise.all([
      sb.from("shops").select("*").order("created_at", { ascending: true }),
      sb.from("nicks").select("*").order("created_at", { ascending: true }),
      sb.from("posts").select("*, shops:shop_id(code, name)").order("created_at", { ascending: false }),
      sb.from("point_ledger").select("*").eq("shop_id", myShop.id).order("created_at", { ascending: false }).limit(10)
    ]).then(function (rs) {
      allShops = rs[0].data || []; allNicks = rs[1].data || [];
      allPosts = rs[2].data || []; myLedger = rs[3].data || [];
      var me = allShops.filter(function (s) { return s.id === myShop.id; })[0];
      if (me) myShop = me;
      var ids = myNicks().map(function (n) { return n.id; });
      if (!ids.length) { renderAll(); return; }
      sb.from("tasks")
        .select("*, posts:post_id(title, fb_url, shop_id, shops:shop_id(code, name)), comment_samples:sample_id(content)")
        .in("nick_id", ids).order("created_at", { ascending: true }).limit(500)
        .then(function (r) {
          myTasks = r.data || [];
          myTasks.forEach(function (t) { if (t.status === "opened" && t.unlock_at) unlockMap[t.id] = t.unlock_at; });
          if (!activeNickId && myNicks().length) activeNickId = myNicks()[0].id;
          renderAll();
        });
    });
  }

  function renderAll() {
    // Thanh bên
    $("pill-code").textContent = myShop.code;
    $("pill-name").textContent = myShop.name;
    $("pill-points").textContent = myShop.points + " điểm" + (myShop.is_admin ? " · Admin" : "");
    $("side-shop-name").textContent = myShop.code + " · " + myShop.name;
    $("side-points").textContent = myShop.points;
    $("side-nick-count").textContent = myNicks().length;
    $("nav-admin").classList.toggle("hidden", !myShop.is_admin);
    var pending = myTasks.filter(function (t) { return t.status === "assigned" || t.status === "opened"; }).length;
    $("nav-task-count").textContent = pending ? String(pending) : "";
    renderOverview(); renderShops(); renderTasks(); renderRanking(); renderPosts(); renderAccount(); renderAdmin();
    updateCostHints();
  }

  /* ---------------- điều hướng ---------------- */
  function bindApp() {
    $("side-nav").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-view]"); if (!btn) return;
      showView(btn.getAttribute("data-view"));
    });
    $("btn-logout").addEventListener("click", signOut);
    $("btn-logout-2").addEventListener("click", signOut);

    // Thêm nhiệm vụ nhanh (thanh bên)
    $("qp-wanted").addEventListener("input", updateCostHints);
    $("quick-post-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var title = $("qp-title").value.trim(), url = $("qp-url").value.trim();
      var wanted = parseInt($("qp-wanted").value, 10);
      var samples = generateSamples(title, "chung", wanted);
      sb.rpc("create_post", { p_fb_url: url, p_title: title, p_caption: "", p_category: "chung",
        p_wanted: wanted, p_samples: samples }).then(function (r) {
        if (r.data && r.data.ok) { toast("Đã đăng bài & chia việc 🎉"); e.target.reset(); $("qp-wanted").value = 5; loadAll(); showView("posts"); }
        else toast("Chưa đăng được: " + ((r.data && r.data.message) || (r.error && r.error.message) || "lỗi lạ"));
      });
    });

    // Thêm nick
    $("add-nick-form").addEventListener("submit", function (e) {
      e.preventDefault();
      $("nick-error").classList.add("hidden");
      sb.rpc("add_nick", { p_display_name: $("nick-name").value.trim(), p_profile_url: $("nick-url").value.trim() })
        .then(function (r) {
          if (r.data && r.data.ok) { toast("Đã thêm nick " + r.data.nick.code + " — dùng được ngay ✅"); e.target.reset(); loadAll(); }
          else { var el = $("nick-error"); el.textContent = (r.data && r.data.message) || "Chưa thêm được nick."; el.classList.remove("hidden"); }
        });
    });

    // Đăng bài đầy đủ
    $("pf-wanted").addEventListener("input", function () { previewSamples = null; updateCostHints(); });
    $("pf-title").addEventListener("input", function () { previewSamples = null; });
    $("pf-category").addEventListener("change", function () { previewSamples = null; });
    $("btn-preview-samples").addEventListener("click", function () {
      var wanted = parseInt($("pf-wanted").value, 10) || 0;
      previewSamples = generateSamples($("pf-title").value.trim(), $("pf-category").value, wanted);
      previewKey = sampleKey();
      var box = $("samples-preview");
      box.innerHTML = "<b>" + previewSamples.length + " câu gợi ý duy nhất</b> (mỗi việc 1 câu khác nhau):<ol>" +
        previewSamples.slice(0, 10).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" +
        (previewSamples.length > 10 ? "<p class='muted small'>… và " + (previewSamples.length - 10) + " câu nữa.</p>" : "");
      box.classList.remove("hidden");
    });
    $("post-form").addEventListener("submit", function (e) {
      e.preventDefault();
      $("post-error").classList.add("hidden");
      var wanted = parseInt($("pf-wanted").value, 10);
      if (!previewSamples || previewKey !== sampleKey()) {
        previewSamples = generateSamples($("pf-title").value.trim(), $("pf-category").value, wanted);
        previewKey = sampleKey();
      }
      sb.rpc("create_post", { p_fb_url: $("pf-url").value.trim(), p_title: $("pf-title").value.trim(),
        p_caption: $("pf-caption").value, p_category: $("pf-category").value,
        p_wanted: wanted, p_samples: previewSamples }).then(function (r) {
        if (r.data && r.data.ok) { toast("Đã đăng bài & bắt đầu chia việc 🎉"); e.target.reset(); $("pf-wanted").value = 5; previewSamples = null; loadAll(); }
        else { var el = $("post-error"); el.textContent = (r.data && r.data.message) || "Chưa đăng được bài."; el.classList.remove("hidden"); }
      });
    });

    // Đổi tên shop + admin
    $("rename-form").addEventListener("submit", function (e) {
      e.preventDefault();
      sb.rpc("rename_my_shop", { p_name: $("rename-input").value.trim() }).then(function (r) {
        if (r.data && r.data.ok) { toast("Đã đổi tên shop ✅"); loadAll(); }
      });
    });
    $("btn-run-dist").addEventListener("click", function () {
      sb.rpc("run_distribution").then(function (r) {
        $("dist-result").textContent = r.data && r.data.ok ? ("Đã tạo thêm " + (r.data.tasks_created || 0) + " việc.") : "Chưa chạy được.";
        loadAll();
      });
    });

    setInterval(tickCountdowns, 250);
  }
  function sampleKey() { return $("pf-title").value.trim() + "|" + $("pf-category").value + "|" + $("pf-wanted").value; }
  function signOut() { sb.auth.signOut().then(function () { location.reload(); }); }

  function showView(name) {
    currentView = name;
    ["overview", "shops", "tasks", "ranking", "posts", "account", "admin"].forEach(function (v) {
      $("view-" + v).classList.toggle("hidden", v !== name);
    });
    document.querySelectorAll("#side-nav .nav-item").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-view") === name);
    });
    window.scrollTo({ top: 0 });
  }

  /* ---------------- render: tổng quan ---------------- */
  function topRows(items, label) {
    if (!items.length) return "<div class='empty'>Chưa có dữ liệu.</div>";
    return items.map(function (it, i) {
      return "<div class='top-row'><span>" + (i + 1) + ", " + esc(it.code) + " · " + esc(it.name) + "</span><span class='pts'>" + it.value + " " + label + "</span></div>";
    }).join("");
  }
  function tops() {
    var givers = allShops.map(function (s) { return { code: s.code, name: s.name, value: givenByShop(s.id) }; })
      .filter(function (x) { return x.value > 0; }).sort(function (a, b) { return b.value - a.value; }).slice(0, 5);
    var receivers = allShops.map(function (s) { return { code: s.code, name: s.name, value: receivedByShop(s.id) }; })
      .filter(function (x) { return x.value > 0; }).sort(function (a, b) { return b.value - a.value; }).slice(0, 5);
    return { givers: givers, receivers: receivers };
  }
  function postLine(p, opts) {
    opts = opts || {};
    var pct = p.wanted ? Math.round((p.received / p.wanted) * 100) : 0;
    var pin = p.is_pinned ? "<span class='pin-badge'>📌 GHIM</span> " : "";
    var pinBtn = (myShop.is_admin && opts.pinBtn) ?
      " <button class='btn ghost small' data-pin='" + p.id + "'>" + (p.is_pinned ? "Bỏ ghim" : "Ghim") + "</button>" : "";
    var cancelBtn = opts.cancelBtn ?
      " <button class='btn danger small' data-cancel='" + p.id + "'>Hủy bài</button>" : "";
    return "<div class='task-line'>" + pin + "<b>" + esc(p.shops ? p.shops.code : "") + "</b>" +
      "<span class='grow'><b>" + esc(p.title) + "</b> · " + esc(p.shops ? p.shops.name : "") + "</span>" +
      "<a href='" + esc(p.fb_url) + "' target='_blank' rel='noopener'>Link ↗</a>" +
      "<span>Cần " + p.wanted + "</span>" +
      "<span class='progress'><div style='width:" + pct + "%'></div></span>" +
      "<span class='progress-num'>" + p.received + "/" + p.wanted + "</span>" + pinBtn + cancelBtn + "</div>";
  }

  function renderOverview() {
    $("hero-title").textContent = "Xin chào, " + myShop.name + " 👋";
    $("hero-points").textContent = myShop.points;
    var t = tops();
    $("top-givers").innerHTML = topRows(t.givers, "điểm");
    $("top-receivers").innerHTML = topRows(t.receivers, "điểm");
    var ongoing = allPosts.filter(function (p) { return p.status === "active"; })
      .sort(function (a, b) { return (b.is_pinned - a.is_pinned) || (a.created_at < b.created_at ? 1 : -1); });
    $("ongoing-list").innerHTML = ongoing.length ? ongoing.map(function (p) { return postLine(p, {}); }).join("")
      : "<div class='empty'>Chưa có nhiệm vụ nào đang diễn ra. Đăng bài đầu tiên ở mục Bài viết nhé!</div>";
    $("ledger-list").innerHTML = myLedger.length ? myLedger.map(function (l) {
      return "<div class='ledger-row'><span>" + esc(l.reason) + "</span><span class='" +
        (l.delta >= 0 ? "plus" : "minus") + "'>" + (l.delta >= 0 ? "+" : "") + l.delta + "</span></div>";
    }).join("") : "<div class='empty'>Chưa có biến động nào.</div>";
  }

  /* ---------------- render: quản lý shop ---------------- */
  function renderShops() {
    $("my-shop-info").innerHTML =
      "<p>Mã shop: <b>" + esc(myShop.code) + "</b> · Tên: <b>" + esc(myShop.name) + "</b></p>" +
      "<p>Số dư điểm: <b>" + myShop.points + "</b> · Đã đi tương tác: <b>" + givenByShop(myShop.id) +
      "</b> · Đã nhận: <b>" + receivedByShop(myShop.id) + "</b> comment</p>";
    var ns = myNicks();
    $("nick-count-title").textContent = ns.length;
    $("nick-list").innerHTML = ns.length ? ns.map(function (n) {
      return "<div class='shop-row'><span><b>" + esc(n.code) + "</b> · " + esc(n.display_name) + " — " +
        "<a href='" + esc(n.profile_url) + "' target='_blank' rel='noopener'>" + esc(n.profile_url) + "</a></span>" +
        "<span>Đã kiếm <b>" + n.points_earned + "</b> điểm · Hôm nay xong " + doneTodayByNick(n.id) + "/12 việc</span></div>";
    }).join("") : "<div class='empty'>Chưa có nick nào — thêm nick đầu tiên ở form dưới.</div>";
    $("all-shops").innerHTML = allShops.map(function (s) {
      var cnt = allNicks.filter(function (n) { return n.shop_id === s.id; }).length;
      return "<div class='shop-row'><span><b>" + esc(s.code) + "</b> · " + esc(s.name) + (s.is_admin ? " 🛡️" : "") +
        "</span><span>" + cnt + " nick · Số dư <b>" + s.points + "</b> · Đã cho " + givenByShop(s.id) + " · Đã nhận " + receivedByShop(s.id) + "</span></div>";
    }).join("");
  }

  /* ---------------- render + làm việc: nhiệm vụ ---------------- */
  function renderTasks() {
    var ns = myNicks();
    $("nick-tabs").innerHTML = ns.map(function (n) {
      var pend = myTasks.filter(function (t) { return t.nick_id === n.id && (t.status === "assigned" || t.status === "opened"); }).length;
      return "<button class='nick-tab" + (n.id === activeNickId ? " active" : "") + "' data-nick='" + n.id + "'>" +
        esc(n.code) + " · " + esc(n.display_name) + " (" + pend + " việc)</button>";
    }).join("") || "<div class='empty'>Hãy thêm nick Facebook ở mục Quản lý shop trước.</div>";
    document.querySelectorAll("[data-nick]").forEach(function (b) {
      b.addEventListener("click", function () { activeNickId = b.getAttribute("data-nick"); renderTasks(); });
    });
    if (!activeNickId) { $("task-list").innerHTML = ""; $("today-progress").textContent = ""; return; }
    $("today-progress").textContent = "Hôm nay nick này đã xong " + doneTodayByNick(activeNickId) + "/12 việc.";
    var list = myTasks.filter(function (t) { return t.nick_id === activeNickId && (t.status === "assigned" || t.status === "opened"); });
    $("task-list").innerHTML = list.length ? list.map(function (t, i) { return workCard(t, i === 0); }).join("")
      : "<div class='empty'>Nick này chưa có việc nào. Hệ thống sẽ tự chia việc khi có bài mới 🎉</div>";
    list.forEach(function (t) { bindWorkCard(t); });
  }

  function workCard(t, isCurrent) {
    var opened = t.status === "opened";
    var sample = t.comment_samples ? t.comment_samples.content : "";
    return "<div class='work-card" + (isCurrent ? " current" : "") + "' id='card-" + t.id + "'>" +
      "<h4>" + (t.posts && t.posts.shops ? esc(t.posts.shops.code) + " · " : "") + esc(t.posts ? t.posts.title : "Bài viết") + "</h4>" +
      "<p class='muted small'>Shop: " + esc(t.posts && t.posts.shops ? t.posts.shops.name : "") + " · Câu gợi ý (hãy sửa vài chữ theo giọng của bạn trước khi đăng):</p>" +
      "<div class='sample-box'>" + esc(sample) + "</div>" +
      "<div class='work-actions'>" +
        "<button class='btn teal' data-open='" + t.id + "'>" + (opened ? "↗ Mở lại bài Facebook" : "↗ Mở bài (tự sao chép câu gợi ý)") + "</button>" +
        "<button class='btn primary' data-done='" + t.id + "' " + (opened ? "" : "disabled") + " data-unlock='" + (unlockMap[t.id] || "") + "'>" +
          (opened ? "Xong" : "Xong (mở bài trước)") + "</button>" +
      "</div></div>";
  }

  function bindWorkCard(t) {
    var openBtn = document.querySelector("[data-open='" + t.id + "']");
    var doneBtn = document.querySelector("[data-done='" + t.id + "']");
    if (openBtn) openBtn.addEventListener("click", function () { openTask(t); });
    if (doneBtn) doneBtn.addEventListener("click", function () { completeTask(t); });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).catch(function () {});
    var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta);
    ta.select(); try { document.execCommand("copy"); } catch (e) {} document.body.removeChild(ta);
    return Promise.resolve();
  }

  function openTask(t) {
    sb.rpc("open_task", { p_task_id: t.id }).then(function (r) {
      if (!r.data || !r.data.ok) { toast("Chưa mở được việc này."); return; }
      unlockMap[t.id] = r.data.unlock_at;
      t.status = "opened"; t.unlock_at = r.data.unlock_at;
      var sample = t.comment_samples ? t.comment_samples.content : "";
      copyText(sample);
      window.open(t.posts ? t.posts.fb_url : "#", "_blank");
      renderTasks();
      toast("Đã sao chép câu gợi ý — dán vào Facebook, comment xong quay lại bấm Xong 📋");
    });
  }

  function completeTask(t) {
    sb.rpc("complete_task", { p_task_id: t.id }).then(function (r) {
      if (r.data && r.data.ok) {
        toast("Xong! +1 điểm 🎉 Đang chuyển việc tiếp theo…");
        loadAll();
        setTimeout(function () {
          var el = document.querySelector(".work-card");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 350);
        return;
      }
      if (r.data && r.data.error === "too_early") {
        unlockMap[t.id] = new Date(Date.now() + (r.data.remaining_seconds || 25) * 1000).toISOString();
        toast("Chưa đủ 25 giây — còn " + r.data.remaining_seconds + " giây nữa ⏳");
        renderTasks();
        return;
      }
      toast("Chưa xong được: " + ((r.data && r.data.message) || "thử lại nhé"));
    });
  }

  function tickCountdowns() {
    document.querySelectorAll("[data-done]").forEach(function (btn) {
      var unlock = btn.getAttribute("data-unlock");
      if (!unlock) return;
      var rem = remainingSeconds(unlock, Date.now());
      if (rem > 0) { btn.disabled = true; btn.textContent = "Xong (còn " + rem + "s)"; }
      else if (btn.disabled) { btn.disabled = false; btn.textContent = "Xong ✅"; }
    });
  }

  /* ---------------- render: xếp hạng ---------------- */
  function renderRanking() {
    var t = tops();
    var rankList = function (items) {
      return items.length ? items.map(function (it, i) {
        return "<div class='rank-row'><span>" + (i + 1) + ". <b>" + esc(it.code) + "</b> · " + esc(it.name) + "</span><b>" + it.value + "</b></div>";
      }).join("") : "<div class='empty'>Chưa có dữ liệu.</div>";
    };
    $("rank-givers").innerHTML = rankList(t.givers);
    $("rank-receivers").innerHTML = rankList(t.receivers);
    var nicks = allNicks.slice().sort(function (a, b) { return b.points_earned - a.points_earned; }).slice(0, 10);
    $("rank-nicks").innerHTML = nicks.length ? nicks.map(function (n, i) {
      var s = shopById(n.shop_id);
      return "<div class='rank-row'><span>" + (i + 1) + ". <b>" + esc(n.code) + "</b> · " + esc(n.display_name) +
        " <span class='muted'>(" + esc(s.name || "") + ")</span></span><b>" + n.points_earned + " điểm</b></div>";
    }).join("") : "<div class='empty'>Chưa có nick nào.</div>";
  }

  /* ---------------- render: bài viết ---------------- */
  function updateCostHints() {
    if (!myShop) return;
    [["qp-wanted", "qp-cost"], ["pf-wanted", "pf-cost"]].forEach(function (pair) {
      var input = $(pair[0]), hint = $(pair[1]);
      if (!input || !hint) return;
      var h = calcCostHint(input.value, myShop.points);
      hint.textContent = "Bài này tốn tối đa " + h.cost + " điểm · Số dư của shop: " + myShop.points + " điểm" +
        (h.enough ? "" : " — chưa đủ điểm: bài sẽ tạm ngừng chia khi hết điểm, đi làm việc kiếm thêm là chạy tiếp") +
        (h.daysNeeded > 1 ? " · Trần 15 comment/ngày nên cần tối thiểu ~" + h.daysNeeded + " ngày" : "");
      hint.classList.toggle("warn", !h.enough);
    });
  }

  function renderPosts() {
    var mine = allPosts.filter(function (p) { return p.shop_id === myShop.id && p.status === "active"; });
    var doneCount = allPosts.filter(function (p) { return p.shop_id === myShop.id && p.status === "completed"; }).length;
    $("my-posts").innerHTML = (mine.length ? mine.map(function (p) {
      return postLine(p, { pinBtn: true, cancelBtn: true });
    }).join("") : "<div class='empty'>Chưa có bài nào đang chạy.</div>") +
      (doneCount ? "<p class='muted small'>Đã có " + doneCount + " bài hoàn thành (đã tự ẩn khỏi danh sách).</p>" : "");
    bindPostButtons($("my-posts"));
  }

  function bindPostButtons(container) {
    if (!container) return;
    container.querySelectorAll("[data-pin]").forEach(function (b) {
      b.addEventListener("click", function () {
        sb.rpc("toggle_pin_post", { p_post_id: b.getAttribute("data-pin") }).then(function (r) {
          if (r.data && r.data.ok) { toast(r.data.is_pinned ? "Đã ghim bài 📌" : "Đã bỏ ghim"); loadAll(); }
          else toast((r.data && r.data.message) || "Chỉ Admin mới ghim được.");
        });
      });
    });
    container.querySelectorAll("[data-cancel]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!window.confirm("Hủy bài này? Việc chưa làm sẽ bị hủy, điểm chưa dùng không bị trừ.")) return;
        sb.rpc("cancel_post", { p_post_id: b.getAttribute("data-cancel") }).then(function (r) {
          if (r.data && r.data.ok) { toast("Đã hủy bài"); loadAll(); } else toast("Chưa hủy được.");
        });
      });
    });
  }

  /* ---------------- render: tài khoản + admin ---------------- */
  function renderAccount() {
    $("account-info").innerHTML =
      "<p>Email đăng nhập: <b>" + esc(session ? session.user.email : "") + "</b></p>" +
      "<p>Shop: <b>" + esc(myShop.code) + " · " + esc(myShop.name) + "</b>" + (myShop.is_admin ? " · 🛡️ Admin" : "") + "</p>" +
      "<p>Số dư điểm: <b>" + myShop.points + "</b> · Nick Facebook: <b>" + myNicks().length + "</b>/3</p>";
    $("rename-input").placeholder = myShop.name;
  }

  function renderAdmin() {
    if (!myShop.is_admin) return;
    var activePosts = allPosts.filter(function (p) { return p.status === "active"; }).length;
    $("admin-stats").innerHTML =
      "<div class='stat'>Shop<b>" + allShops.length + "</b></div>" +
      "<div class='stat'>Nick<b>" + allNicks.length + "</b></div>" +
      "<div class='stat'>Bài đang chạy<b>" + activePosts + "</b></div>" +
      "<div class='stat'>Tổng điểm hệ thống<b>" + allShops.reduce(function (a, s) { return a + s.points; }, 0) + "</b></div>" +
      "<div class='stat'>Comment đã nhận<b>" + allPosts.reduce(function (a, p) { return a + p.received; }, 0) + "</b></div>";
    var posts = allPosts.filter(function (p) { return p.status !== "cancelled"; });
    $("admin-posts").innerHTML = posts.length ? posts.map(function (p) {
      return postLine(p, { pinBtn: true, cancelBtn: p.status === "active" });
    }).join("") : "<div class='empty'>Chưa có bài nào.</div>";
    bindPostButtons($("admin-posts"));
    $("admin-shops").innerHTML = allShops.map(function (s) {
      return "<div class='shop-row'><span><b>" + esc(s.code) + "</b> · " + esc(s.name) + "</span>" +
        "<span>Số dư <b>" + s.points + "</b></span>" +
        "<span class='admin-adjust'><input type='number' id='adj-" + s.id + "' placeholder='+5 / -5'>" +
        "<button class='btn ghost small' data-adjust='" + s.id + "'>Áp dụng</button></span></div>";
    }).join("");
    document.querySelectorAll("[data-adjust]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-adjust");
        var delta = parseInt($("adj-" + id).value, 10);
        if (!delta) { toast("Nhập số điểm cần chỉnh (VD: 5 hoặc -5)"); return; }
        sb.rpc("admin_adjust_points", { p_shop_id: id, p_delta: delta, p_reason: "Admin điều chỉnh điểm" })
          .then(function (r) {
            if (r.data && r.data.ok) { toast("Đã chỉnh điểm ✅"); loadAll(); }
            else toast("Chưa chỉnh được (chỉ Admin).");
          });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
}
