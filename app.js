// SUPABASE
let supabaseUrl = "https://crbeekfpkgentygvmpan.supabase.co";
let supabaseKey = "sb_publishable_UnIX2XJfbSOHPYqgTIq_Ew_7CCBRPpC";

const { createClient } = supabase;
const client = createClient(supabaseUrl, supabaseKey);

console.log(client);

// SIGN UP FORM

const form = document.querySelector("#signupForm");
const signupEmail = document.querySelector("#signupEmail");
const signuppassword = document.querySelector("#signuppassword");
const signupBtn = document.querySelector("#signupBtn");

signupBtn &&
  signupBtn.addEventListener("click", async () => {
    try {
      let checkSignupInputs = false;

      // border red
      const signupInputs = document.querySelectorAll(".signupInputs");
      signupInputs.forEach((inputs) => {
        if (inputs.value == "") {
          inputs.style.border = "2px solid red";
          checkSignupInputs = true;
        }
      });

      if (checkSignupInputs) {
        return;
      }

      // supabase sign up
      const { data, error } = await client.auth.signUp({
        email: signupEmail.value,
        password: signuppassword.value,
      });

      if (error) throw error;

      // sweetalert
      Swal.fire({
        title: "Sign up successfully",
        icon: "success",
        draggable: true,
      });
      form.reset();

      window.location.href = "./dashboard.html";
    } catch (error) {
      console.log("signup error");

      Swal.fire(error.message);
    }
  });

//   border blue
const signupInputs = document.querySelectorAll(".signupInputs");
signupInputs.forEach((blueInputs) => {
  blueInputs.addEventListener("input", () => {
    if (blueInputs.value !== "") {
      blueInputs.style.border = "2px solid blue";
    }
  });
});

// LOG IN FORM

const loginForm = document.querySelector("#loginForm");
const loginPassword = document.querySelector("#loginPassword");
const loginEmail = document.querySelector("#loginEmail");
const loginBtn = document.querySelector("#loginBtn");

loginBtn &&
  loginBtn.addEventListener("click", async () => {
    try {
      let checkLoginInputs = false;
      // border red
      const loginInputs = document.querySelectorAll(".loginInputs");
      loginInputs.forEach((inputs) => {
        if (inputs.value == "") {
          inputs.style.border = "2px solid red";
          checkLoginInputs = true;
        }
      });

      if (checkLoginInputs) {
        return;
      }

      // supabase login
      const { data, error } = await client.auth.signInWithPassword({
        email: loginEmail.value,
        password: loginPassword.value,
      });
      // console.log(data);
      // console.log(error);

      if (error) throw error;

      // sweetalert
      Swal.fire({
        title: "Log in successfully",
        icon: "success",
        draggable: true,
      });
      loginForm.reset();

      window.location.href = "./dashboard.html";
    } catch (error) {
      console.log("login error");

      Swal.fire(error.message);
    }
  });

//   border blue
const loginInputs = document.querySelectorAll(".loginInputs");
loginInputs.forEach((bluelgInputs) => {
  bluelgInputs.addEventListener("input", () => {
    if (bluelgInputs.value !== "") {
      bluelgInputs.style.border = "2px solid blue";
    }
  });
});

// LOG OUT FUNCTIONING
const logoutBtn = document.querySelector("#logoutBtn");

logoutBtn &&
  logoutBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    const { error: logoutError } = await client.auth.signOut();

    console.log("Logout error:", logoutError);
    Swal.fire("Something went wrong, please try again.");

    Swal.fire("Logout successfully");
    window.location.href = "../index.html";
  });

// POST ITEMS Btn :  USER SIGNUP / USER PFP
const goToDashboard = document.querySelector("#goToDashboard");

goToDashboard &&
  goToDashboard.addEventListener("click", async () => {
    const {
      data: { user },
      error,
    } = await client.auth.getUser();

    if (!user || error) {
      window.location.href = "#";
    } else {
      window.location.href = "./pages/dashboard.html";
    }
  });

// USER DASHBOARD UI
const userPfp = document.querySelector("#userPfp");
const userInfo = document.querySelector("#userInfo");
const userName = document.querySelector("#userName");
const userEmail = document.querySelector("#userEmail");
const userJoinDate = document.querySelector("#userJoinDate");

// start
client.auth.onAuthStateChange((event, session) => {
  if (event === "INITIAL_SESSION") {
    if (!userPfp) return;

    if (session?.user) {
      loadUserProfile(session.user);
    } else {
      Swal.fire("No user found");
    }
  }
});

async function loadUserProfile(user) {
  const firstLetter = user.email.charAt(0).toUpperCase();
  userPfp.textContent = firstLetter;

  userEmail.textContent = user?.email;

  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  userJoinDate.textContent = `Joined ${joinDate}`;
}
// end

// USER POSTING ITEMS
const newPostForm = document.querySelector("#newPostForm");

newPostForm &&
  newPostForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // get user data(id)
    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();

    if (userError || !user) {
      Swal.fire("Please login first!");
      return;
    }

    const title = document.querySelector("#postTitle").value;
    const price = document.querySelector("#postPrice").value;
    const description = document.querySelector("#postDescription").value;
    const imageFile = document.querySelector("#postImage").files[0];

    // image upload
    const { data: uploadData, error: uploadError } = await client.storage
      .from("item-images")
      .upload(`${Date.now()}_${imageFile.name}`, imageFile);

    if (uploadError) {
      console.log(uploadError);
      Swal.fire("Something went wrong, please try again.");
      return;
    }

    // get url
    const { data: urlData } = client.storage
      .from("item-images")
      .getPublicUrl(uploadData.path);

    // insert data
    const { data: insertData, error: insertError } = await client
      .from("items")
      .insert({
        user_id: user.id,
        title,
        price,
        description,
        image_url: urlData.publicUrl,
      });

    if (insertError) {
      console.log(insertError);
      Swal.fire("Something went wrong, please try again.");
      return;
    }

    Swal.fire("Item posted successfully!").then(() => {
      newPostForm.reset();
      window.location.reload();
    });
  });

// USER POSTS UI
const postsContainer = document.querySelector("#postsContainer");

async function loadPosts() {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return;

  const { data: items, error } = await client
    .from("items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("loading posts:" + error);
  }

  postsContainer.innerHTML = "";

  items.forEach((item) => {
    postsContainer.innerHTML += `
    <div  class="card" style="width: 18rem;">
      <img class="card-img-top" src="${item.image_url}" alt="${item.title}" style="height: 200px; width=100% ; object-fit: cover;">
      <div class="card-body">
        <h5 class="card-title">${item.title}</h5>
        <p class="card-text">Rs. ${item.price}</p>
        <p class="card-text">${item.description}</p>
        <button class="dltBtn btn btn-danger" data-id="${item.id}">Delete</button>
      </div>
    </div>
  `;
  });
}
loadPosts();

// DELETE BUTTON
postsContainer &&
  postsContainer.addEventListener("click", async (event) => {
    event.preventDefault();

    if (!event.target.classList.contains("dltBtn")) {
      return; // agar delete button nahi hai to kuch mat karo
    }

    const itemId = event.target.dataset.id; // data-id se item ka ID nikala
    //  console.log(itemId);

    const { error } = await client.from("items").delete().eq("id", itemId);

    if (error) {
      Swal.fire(error.message);
      return;
    }

    Swal.fire("Item deleted!");

    window.location.reload();
  });

loadPosts();

// FEED PAGE
const feedContainer = document.querySelector("#feedContainer");

async function loadAllPosts() {
  try {
    const { data: items, error } = await client
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("loading all user posts:" + error);
    }

    feedContainer.innerHTML = "";

    items.forEach((item) => {
      feedContainer.innerHTML += `
    <div  class="card" style="width: 18rem;">
      <img class="card-img-top" src="${item.image_url}" alt="${item.title}" style="height: 200px; width=100% ; object-fit: cover;">
      <div class="card-body">
        <h5 class="card-title">${item.title}</h5>
        <p class="card-text">Rs. ${item.price}</p>
        <p class="card-text">${item.description}</p>
        <button class="dltBtn btn btn-danger" data-id="${item.id}">Delete</button>
      </div>
    </div>
  `;
    });
  } catch (err) {
    console.log("Unexpected error:", err);
    Swal.fire("Something went wrong, please try again.");
  }
}
feedContainer && loadAllPosts();


// FEED PAGE NAVBAR 
const loggedOutNavbar = document.querySelector("#loggedOutNavbar");
const loggedInNavbar = document.querySelector("#loggedInNavbar");

client.auth.onAuthStateChange((event, session) => {
  try{
    if (session?.user) {
    // user login hai
    loggedInNavbar.style.display = "block";
    loggedOutNavbar.style.display = "none";
  } else {
    // user login nahi hai
    loggedInNavbar.style.display = "none";
    loggedOutNavbar.style.display = "block";
  }
  }catch(error){
    console.log("navbar feed page" + error);
    
  }
});


// EDIT BUTTON 

