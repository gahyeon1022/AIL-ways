module.exports = [
"[project]/Desktop/AIL-ways/apps/frontend/src/components/LocalLoginModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LocalLoginModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/AIL-ways/apps/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/AIL-ways/apps/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/AIL-ways/apps/frontend/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/AIL-ways/apps/frontend/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/AIL-ways/apps/frontend/node_modules/next/navigation.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const API_BASE = ("TURBOPACK compile-time value", "http://localhost:8080");
function LocalLoginModal({ open, onClose }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [userId, setUserId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [userPw, setUserPw] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    async function onSubmit(e) {
        e.preventDefault(); //새로고침 방지
        if (!userId || !userPw) return;
        setLoading(true); //서버로 보낼 요청 생성
        try {
            {}
            const res = await fetch(`${API_BASE}/api/auth/local/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    userId,
                    userPw
                })
            });
            if (!res.ok) throw new Error("로그인 실패");
            router.replace("/select");
            onClose();
        } catch (err) {
            alert(err.message ?? "문제가 발생했습니다.");
        } finally{
            setLoading(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AnimatePresence"], {
        children: open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
            className: "fixed inset-0 z-50",
            initial: {
                opacity: 0
            },
            animate: {
                opacity: 1
            },
            exit: {
                opacity: 0
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onClose,
                    className: "absolute inset-0 bg-black/40"
                }, void 0, false, {
                    fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/components/LocalLoginModal.tsx",
                    lineNumber: 58,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        y: -24,
                        opacity: 0
                    },
                    animate: {
                        y: 0,
                        opacity: 1
                    },
                    exit: {
                        y: -24,
                        opacity: 0
                    },
                    transition: {
                        type: "spring",
                        stiffness: 280,
                        damping: 24
                    },
                    className: "absolute left-1/2 top-10 w-[92vw] max-w-md -translate-x-1/2 rounded-2xl bg-white/90 backdrop-blur p-6 shadow-2xl",
                    role: "dialog",
                    "aria-modal": "true",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-4 flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-semibold text-gray-800",
                                    children: "이메일로 로그인"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/components/LocalLoginModal.tsx",
                                    lineNumber: 75,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onClose,
                                    className: "rounded p-1 text-gray-500 hover:bg-gray-100",
                                    children: "✕"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/components/LocalLoginModal.tsx",
                                    lineNumber: 76,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/components/LocalLoginModal.tsx",
                            lineNumber: 74,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: onSubmit,
                            className: "grid gap-3 text-left",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-left text-sm font-medium text-gray-700",
                                    children: [
                                        "아이디",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            required: true,
                                            value: userId,
                                            onChange: (e)=>setUserId(e.target.value),
                                            placeholder: "아이디를 입력해주세요.",
                                            className: "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/components/LocalLoginModal.tsx",
                                            lineNumber: 88,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/components/LocalLoginModal.tsx",
                                    lineNumber: 86,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-left text-sm font-medium text-gray-700",
                                    children: [
                                        "비밀번호",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "password",
                                            required: true,
                                            value: userPw,
                                            onChange: (e)=>setUserPw(e.target.value),
                                            placeholder: "••••••••",
                                            className: "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/components/LocalLoginModal.tsx",
                                            lineNumber: 101,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/components/LocalLoginModal.tsx",
                                    lineNumber: 99,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    disabled: loading,
                                    className: "mt-3 w-full rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60",
                                    children: loading ? "처리 중..." : "로그인"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/components/LocalLoginModal.tsx",
                                    lineNumber: 111,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/components/LocalLoginModal.tsx",
                            lineNumber: 84,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/components/LocalLoginModal.tsx",
                    lineNumber: 64,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/components/LocalLoginModal.tsx",
            lineNumber: 51,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/components/LocalLoginModal.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/AIL-ways/apps/frontend/src/app/login/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoginPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/AIL-ways/apps/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/AIL-ways/apps/frontend/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/AIL-ways/apps/frontend/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/AIL-ways/apps/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$src$2f$components$2f$LocalLoginModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/AIL-ways/apps/frontend/src/components/LocalLoginModal.tsx [app-ssr] (ecmascript)"); // 경로는 프로젝트 구조에 맞게
"use client";
;
;
;
;
;
function LoginPage() {
    const API_BASE = ("TURBOPACK compile-time value", "http://localhost:8080");
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white/70 p-8 rounded-2xl shadow-lg text-center w-full max-w-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: `${API_BASE}/oauth2/authorization/kakao`,
                        className: "relative flex items-center w-full justify-center rounded-xl px-4 py-3 font-medium bg-[#FEE500] text-black hover:brightness-95 transition inline-block",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                src: "/kakao_logo.png",
                                alt: "Kakao",
                                width: 23,
                                height: 23,
                                className: "absolute left-5 top-3.5"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/app/login/page.tsx",
                                lineNumber: 18,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "leading-none",
                                children: "카카오로 로그인"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/app/login/page.tsx",
                                lineNumber: 19,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/app/login/page.tsx",
                        lineNumber: 15,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: `${API_BASE}/oauth2/authorization/google`,
                        className: "relative flex items-center justify-center w-full rounded-xl px-4 py-3 font-medium bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 transition inline-block",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                src: "/google_logo.png",
                                alt: "google",
                                width: 20,
                                height: 20,
                                className: "absolute left-5 top-4"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/app/login/page.tsx",
                                lineNumber: 25,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "leading-none",
                                children: "구글로 로그인"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/app/login/page.tsx",
                                lineNumber: 26,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/app/login/page.tsx",
                        lineNumber: 22,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setOpen(true),
                        className: "relative flex items-center justify-center w-full rounded-xl px-4 py-3 font-medium bg-indigo-500 text-white hover:bg-indigo-500 transition inline-block",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                src: "/letter.png",
                                alt: "letter",
                                width: 23,
                                height: 23,
                                className: "absolute left-5 top-3"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/app/login/page.tsx",
                                lineNumber: 32,
                                columnNumber: 11
                            }, this),
                            "이메일로 로그인"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/app/login/page.tsx",
                        lineNumber: 29,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-[1px] bg-gray-300"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/app/login/page.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "absolute left-1/2 -translate-x-1/2 -top-1 text-xs text-gray-500 rounded",
                            children: [
                                "회원이 아니신가요?",
                                " ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/signup",
                                    className: "text-blue-500 hover:underline",
                                    children: "회원가입"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/app/login/page.tsx",
                                    lineNumber: 41,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/app/login/page.tsx",
                            lineNumber: 39,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/app/login/page.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/app/login/page.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$AIL$2d$ways$2f$apps$2f$frontend$2f$src$2f$components$2f$LocalLoginModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                open: open,
                onClose: ()=>setOpen(false)
            }, void 0, false, {
                fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/app/login/page.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/AIL-ways/apps/frontend/src/app/login/page.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=Desktop_AIL-ways_apps_frontend_src_55f8c399._.js.map