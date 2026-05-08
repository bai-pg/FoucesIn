import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "./stores/auth";
import { pinia } from "./stores";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/signin",
      component: () => import("@/layouts/AuthLayout.vue"),
      meta: {
        requiresNoAuth: true,
      },
      children: [
        {
          path: "/signin",
          name: "signIn",
          component: () => import("@/views/auth/SignIn.vue"),
        },
        {
          path: "/signup",
          name: "signUp",
          component: () => import("@/views/auth/SignUp.vue"),
        },
        {
          path: "/forgotpassword",
          name: "forgotPassword",
          component: () => import("@/views/auth/ForgotPassword.vue"),
        },
      ],
    },
    {
      path: "/resetpassword",
      component: () => import("@/layouts/AuthLayout.vue"),
      children: [
        {
          path: "/reset-password",
          name: "reset-password",
          component: () => import("@/views/auth/ResetPassword.vue"),
          meta: { requiresNoAuth: true },
          beforeEnter: async (to) => {
            // only allow navigation to reset password
            // if we actually clicked a proper reset password link
            // which provides the type=recovery hash key
            if (!to.hash.includes("type=recovery")) {
              const { supabase } = useAuthStore();
              const { data } = await supabase.auth.getUser();
              if (data.user) return "/";
              return "/signin";
            }
          },
        },
        {
          path: "/callback",
          name: "callback",
          component: () => import("@/views/auth/AuthCallback.vue"),
          beforeEnter: (to) => {
            /* Parse the route hash into a dictionary */
            const hashDictionary = {} as any;
            // first remove the actual '#' character
            const hash = to.hash.replace("#", "");
            // split hash into key-value pairs
            hash.split("&").forEach((item) => {
              // split 'key=value' into [key, value]
              const [key, value] = item.split("=");
              // add to results
              hashDictionary[key] = value;
            });

            if (
              [
                "access_token",
                "expires_in",
                "provider_token",
                "refresh_token",
                "token_type",
              ].some((key) => !(key in hashDictionary))
            )
              return "/";
          },
        },
        {
          path: "/:pathMatch(.*)*",
          name: "NotFound",
          component: () => import("@/views/NotFound.vue"),
        },
      ],
    },

    {
      path: "/",
      component: () => import("@/layouts/DashboardLayout.vue"),
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: "/",
          name: "dashboard",
          component: () => import("@/views/DashboardView.vue"),
        },
        {
          path: "/records",
          name: "records",
          component: () => import("@/views/RecordsView.vue"),
        },
        {
          path: "/workflow",
          name: "workflow",
          component: () => import("@/views/workflow/WorkflowCanvasView.vue"),
        },
      ],
    },
  ],
});

const { supabase } = useAuthStore(pinia);

// 缓存用户认证状态，避免每次路由切换都调用 API
let cachedUser: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase Auth State Change:', event, session?.user?.id);
  
  // 当认证状态变化时，清除缓存
  if (event === 'SIGNED_OUT') {
    cachedUser = null;
    cacheTimestamp = 0;
    return router.push("/signin");
  }
  
  if (event === 'SIGNED_IN') {
    // 更新缓存
    cachedUser = session?.user || null;
    cacheTimestamp = Date.now();
    
    const routeName = router.currentRoute.value.name;
    console.log("routeName", routeName);

    if (routeName == "callback") {
      setTimeout(() => {
        return router.push({ name: "dashboard" });
      }, 0);
    }
  }
});

router.beforeEach(async (to) => {
  const now = Date.now();
  
  // 检查缓存是否有效
  const isCacheValid = cachedUser && (now - cacheTimestamp) < CACHE_DURATION;
  
  let isAuthenticated = false;
  
  if (isCacheValid) {
    // 使用缓存的用户信息
    isAuthenticated = !!cachedUser;
  } else {
    // Supabase v2: 使用 getUser() 检查登录状态
    try {
      const { data, error } = await supabase.auth.getUser();
      isAuthenticated = !error && !!data.user;
      
      // 更新缓存
      if (isAuthenticated) {
        cachedUser = data.user;
        cacheTimestamp = now;
      } else {
        cachedUser = null;
        cacheTimestamp = 0;
      }
    } catch (err) {
      console.error('Supabase 认证检查失败:', err);
      // 如果认证检查失败，使用缓存或假设为未登录
      isAuthenticated = !!cachedUser;
      console.warn('使用缓存的认证状态:', isAuthenticated);
    }
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    return {
      path: "/signin",
    };
  }
  
  if (to.meta.requiresNoAuth && isAuthenticated) {
    return {
      path: "/",
    };
  }
});

export default router;