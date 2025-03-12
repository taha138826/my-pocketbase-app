const pb = new PocketBase("http://127.0.0.0:8090"); // بعداً عوض می‌شه
const ADMIN_PASS = "admin123";

async function signup() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) {
    alert("لطفاً نام کاربری و رمز عبور رو پر کن!");
    return;
  }
  if (password.length < 8) {
    alert("رمز عبور باید حداقل ۸ کاراکتر باشه!");
    return;
  }
  try {
    await pb.collection("users").create({
      username: username,
      password: password,
      passwordConfirm: password,
      email: ${username}@example.com,
      isActive: false,
      score: 0,
    });
    alert("ثبت‌نام با موفقیت انجام شد! منتظر تأیید ادمین باش.");
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
  } catch (e) {
    alert("خطا: " + (e.message || "مشکلی پیش اومد"));
  }
}

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) {
    alert("لطفاً نام کاربری و رمز عبور رو پر کن!");
    return;
  }
  try {
    await pb.collection("users").authWithPassword(username, password);
    if (pb.authStore.model.isActive) {
      document.getElementById("login").style.display = "none";
      document.getElementById("main").style.display = "block";
      document.getElementById("admin").style.display = "block";
    } else {
      alert("حساب شما هنوز تأیید نشده! با ادمین تماس بگیر.");
      pb.authStore.clear();
    }
  } catch (e) {
    alert("خطا: " + (e.message || "نام کاربری یا رمز عبور اشتباهه"));
  }
}

async function upload() {
  const text = document.getElementById("text").value.trim();
  const hashtags = document.getElementById("hashtags").value.split(",").map(h => h.trim()).filter(h => h);
  const file = document.getElementById("fileInput").files[0];
  if (!text && !file) {
    alert("حداقل یه متن یا فایل رو وارد کن!");
    return;
  }
  try {
    const formData = new FormData();
    if (file) formData.append("file", file);
    const uploadedFile = await pb.collection("posts").create(formData);
    await pb.collection("posts").update(uploadedFile.id, {
      text: text,
      hashtags: hashtags,
      user: pb.authStore.model.id,
      timestamp: new Date().toISOString(),
    });
    alert("آپلود با موفقیت انجام شد!");
    document.getElementById("text").value = "";
    document.getElementById("hashtags").value = "";
    document.getElementById("fileInput").value = "";
  } catch (e) {
    alert("خطا: " + (e.message || "آپلود ناموفق بود"));
  }
}

async function showReport() {
  try {
    const posts = await pb.collection("posts").getFullList({
      filter: user = "${pb.authStore.model.id}",
      sort: "-timestamp",
    });
    document.getElementById("report").innerHTML = posts.length ? posts.map(p => 
      <div>
        <p><strong>متن:</strong> ${p.text || "بدون متن"}</p>
        <p><strong>هشتگ‌ها:</strong> ${p.hashtags.length ? p.hashtags.join(", ") : "بدون هشتگ"}</p>
        ${p.file ? (p.file.match(/\.(mp4|webm|ogg)$/) ? 
          <video src="${pb.getFileUrl(p, p.file)}" controls></video> : 
          <img src="${pb.getFileUrl(p, p.file)}">) : ""}
      </div>
    ).join("") : "<p>هنوز پستی نداری!</p>";
  } catch (e) {
    alert("خطا: " + (e.message || "نمایش گزارش ناموفق بود"));
  }
}

async function showVideos() {
  try {
    const videos = await pb.collection("admin_videos").getFullList({
      sort: "title",
    });
    const player = document.getElementById("videoPlayer");
    if (videos.length) {
      player.src = pb.getFileUrl(videos[0], videos[0].videoUrl);
      document.getElementById("report").innerHTML = videos.map(v => `
        <p style="cursor: pointer;" onclick="document.getElementById('videoPlayer').src='${pb.getFileUrl(v, v.videoUrl)}'">${v.title} (${v.category || "بدون دسته‌بندی"})
        </p>
      ).join("");
    } else {
      document.getElementById("report").innerHTML = "<p>هنوز ویدیویی اضافه نشده!</p>";
    }
  } catch (e) {
    alert("خطا: " + (e.message || "نمایش ویدیوها ناموفق بود"));
  }
}

function enterAdmin() {
  const pass = document.getElementById("adminPass").value.trim();
  if (pass === ADMIN_PASS) {
    document.getElementById("adminPanel").style.display = "block";
    document.getElementById("adminPass").value = "";
  } else {
    alert("رمز ادمین اشتباهه!");
  }
}

async function approveUser() {
  const username = document.getElementById("targetUser").value.trim();
  if (!username) {
    alert("نام کاربری رو وارد کن!");
    return;
  }
  try {
    const user = await pb.collection("users").getFirstListItem(username="${username}");
    await pb.collection("users").update(user.id, { isActive: true });
    alert(کاربر ${username} با موفقیت تأیید شد!);
    document.getElementById("targetUser").value = "";
  } catch (e) {
    alert("خطا: " + (e.message || "کاربر پیدا نشد"));
  }
}

async function setScore() {
  const username = document.getElementById("targetUser").value.trim();
  const score = document.getElementById("score").value.trim();
  if (!username || !score) {
    alert("نام کاربری و امتیاز رو وارد کن!");
    return;
  }
  try {
    const user = await pb.collection("users").getFirstListItem(username="${username}");
    await pb.collection("users").update(user.id, { score: parseInt(score) });
    alert(امتیاز ${username} به ${score} تغییر کرد!`);
    document.getElementById("targetUser").value = "";
    document.getElementById("score").value = "";
  } catch (e) {
    alert("خطا: " + (e.message || "ثبت امتیاز ناموفق بود"));
  }
}