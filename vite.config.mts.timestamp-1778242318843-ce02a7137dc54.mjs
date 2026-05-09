// vite.config.mts
import { fileURLToPath } from "url";
import { defineConfig } from "file:///C:/Users/23150/Desktop/qd/tes2/vuepabase/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/23150/Desktop/qd/tes2/vuepabase/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import Components from "file:///C:/Users/23150/Desktop/qd/tes2/vuepabase/node_modules/unplugin-vue-components/dist/vite.mjs";
import AutoImport from "file:///C:/Users/23150/Desktop/qd/tes2/vuepabase/node_modules/unplugin-auto-import/dist/vite.mjs";
import Icons from "file:///C:/Users/23150/Desktop/qd/tes2/vuepabase/node_modules/unplugin-icons/dist/vite.mjs";
import IconsResolver from "file:///C:/Users/23150/Desktop/qd/tes2/vuepabase/node_modules/unplugin-icons/dist/resolver.mjs";
import PurgeIcons from "file:///C:/Users/23150/Desktop/qd/tes2/vuepabase/node_modules/vite-plugin-purge-icons/dist/index.mjs";
import ElementPlus from "file:///C:/Users/23150/Desktop/qd/tes2/vuepabase/node_modules/unplugin-element-plus/dist/vite.mjs";
var __vite_injected_original_import_meta_url = "file:///C:/Users/23150/Desktop/qd/tes2/vuepabase/vite.config.mts";
var vite_config_default = defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith("deep-")
        }
      }
    }),
    Icons({ compiler: "vue3" }),
    PurgeIcons({
      content: ["**/*.html", "**/*.js", "**/*.ts", "**/*.vue"]
    }),
    Components({
      dts: true,
      resolvers: [IconsResolver()]
    }),
    AutoImport({
      // targets to transform
      include: [/\.[tj]s?$/, /\.vue$/, /\.vue\?vue/],
      imports: ["vue", "vue-router", "@vueuse/core", "pinia"]
    }),
    ElementPlus({
      useSource: true
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcMjMxNTBcXFxcRGVza3RvcFxcXFxxZFxcXFx0ZXMyXFxcXHZ1ZXBhYmFzZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcMjMxNTBcXFxcRGVza3RvcFxcXFxxZFxcXFx0ZXMyXFxcXHZ1ZXBhYmFzZVxcXFx2aXRlLmNvbmZpZy5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzLzIzMTUwL0Rlc2t0b3AvcWQvdGVzMi92dWVwYWJhc2Uvdml0ZS5jb25maWcubXRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gXCJ1cmxcIjtcclxuXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCB2dWUgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXZ1ZVwiO1xyXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tIFwidW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZVwiO1xyXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tIFwidW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZVwiO1xyXG5pbXBvcnQgSWNvbnMgZnJvbSBcInVucGx1Z2luLWljb25zL3ZpdGVcIjtcclxuaW1wb3J0IEljb25zUmVzb2x2ZXIgZnJvbSBcInVucGx1Z2luLWljb25zL3Jlc29sdmVyXCI7XHJcbmltcG9ydCBQdXJnZUljb25zIGZyb20gXCJ2aXRlLXBsdWdpbi1wdXJnZS1pY29uc1wiO1xyXG5pbXBvcnQgRWxlbWVudFBsdXMgZnJvbSBcInVucGx1Z2luLWVsZW1lbnQtcGx1cy92aXRlXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHZ1ZSh7XHJcbiAgICAgIHRlbXBsYXRlOiB7XHJcbiAgICAgICAgY29tcGlsZXJPcHRpb25zOiB7XHJcbiAgICAgICAgICBpc0N1c3RvbUVsZW1lbnQ6ICh0YWcpID0+IHRhZy5zdGFydHNXaXRoKCdkZWVwLScpLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICAgIEljb25zKHsgY29tcGlsZXI6IFwidnVlM1wiIH0pLFxyXG4gICAgUHVyZ2VJY29ucyh7XHJcbiAgICAgIGNvbnRlbnQ6IFtcIioqLyouaHRtbFwiLCBcIioqLyouanNcIiwgXCIqKi8qLnRzXCIsIFwiKiovKi52dWVcIl0sXHJcbiAgICB9KSxcclxuICAgIENvbXBvbmVudHMoe1xyXG4gICAgICBkdHM6IHRydWUsXHJcbiAgICAgIHJlc29sdmVyczogW0ljb25zUmVzb2x2ZXIoKV0sXHJcbiAgICB9KSxcclxuICAgIEF1dG9JbXBvcnQoe1xyXG4gICAgICAvLyB0YXJnZXRzIHRvIHRyYW5zZm9ybVxyXG4gICAgICBpbmNsdWRlOiBbL1xcLlt0al1zPyQvLCAvXFwudnVlJC8sIC9cXC52dWVcXD92dWUvXSxcclxuICAgICAgaW1wb3J0czogW1widnVlXCIsIFwidnVlLXJvdXRlclwiLCBcIkB2dWV1c2UvY29yZVwiLCBcInBpbmlhXCJdLFxyXG4gICAgfSksXHJcbiAgICBFbGVtZW50UGx1cyh7XHJcbiAgICAgIHVzZVNvdXJjZTogdHJ1ZSxcclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IGZpbGVVUkxUb1BhdGgobmV3IFVSTChcIi4vc3JjXCIsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgfSxcclxuICB9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwVCxTQUFTLHFCQUFxQjtBQUV4VixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFNBQVM7QUFDaEIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sbUJBQW1CO0FBQzFCLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8saUJBQWlCO0FBVDhLLElBQU0sMkNBQTJDO0FBWXZQLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxNQUNGLFVBQVU7QUFBQSxRQUNSLGlCQUFpQjtBQUFBLFVBQ2YsaUJBQWlCLENBQUMsUUFBUSxJQUFJLFdBQVcsT0FBTztBQUFBLFFBQ2xEO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsTUFBTSxFQUFFLFVBQVUsT0FBTyxDQUFDO0FBQUEsSUFDMUIsV0FBVztBQUFBLE1BQ1QsU0FBUyxDQUFDLGFBQWEsV0FBVyxXQUFXLFVBQVU7QUFBQSxJQUN6RCxDQUFDO0FBQUEsSUFDRCxXQUFXO0FBQUEsTUFDVCxLQUFLO0FBQUEsTUFDTCxXQUFXLENBQUMsY0FBYyxDQUFDO0FBQUEsSUFDN0IsQ0FBQztBQUFBLElBQ0QsV0FBVztBQUFBO0FBQUEsTUFFVCxTQUFTLENBQUMsYUFBYSxVQUFVLFlBQVk7QUFBQSxNQUM3QyxTQUFTLENBQUMsT0FBTyxjQUFjLGdCQUFnQixPQUFPO0FBQUEsSUFDeEQsQ0FBQztBQUFBLElBQ0QsWUFBWTtBQUFBLE1BQ1YsV0FBVztBQUFBLElBQ2IsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
