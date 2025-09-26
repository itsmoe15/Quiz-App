# Details

Date : 2025-09-25 21:49:37

Directory c:\\Users\\Moe\\Desktop\\Quiz-App

Total : 83 files,  13925 codes, 397 comments, 1043 blanks, all 15365 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [README.md](/README.md) | Markdown | 425 | 0 | 172 | 597 |
| [backend/package-lock.json](/backend/package-lock.json) | JSON | 6,269 | 0 | 1 | 6,270 |
| [backend/package.json](/backend/package.json) | JSON | 33 | 0 | 1 | 34 |
| [backend/src/app.js](/backend/src/app.js) | JavaScript | 25 | 0 | 6 | 31 |
| [backend/src/config/db.js](/backend/src/config/db.js) | JavaScript | 0 | 0 | 1 | 1 |
| [backend/src/controller/analyticsController.js](/backend/src/controller/analyticsController.js) | JavaScript | 249 | 16 | 48 | 313 |
| [backend/src/controller/attemptController.js](/backend/src/controller/attemptController.js) | JavaScript | 344 | 47 | 65 | 456 |
| [backend/src/controller/authController.js](/backend/src/controller/authController.js) | JavaScript | 53 | 3 | 10 | 66 |
| [backend/src/controller/quizController.js](/backend/src/controller/quizController.js) | JavaScript | 237 | 17 | 43 | 297 |
| [backend/src/controller/resultsController.js](/backend/src/controller/resultsController.js) | JavaScript | 127 | 10 | 23 | 160 |
| [backend/src/controller/userController.js](/backend/src/controller/userController.js) | JavaScript | 25 | 2 | 6 | 33 |
| [backend/src/middleware/auth.js](/backend/src/middleware/auth.js) | JavaScript | 26 | 2 | 6 | 34 |
| [backend/src/model/attemptModel.js](/backend/src/model/attemptModel.js) | JavaScript | 59 | 1 | 6 | 66 |
| [backend/src/model/quizModel.js](/backend/src/model/quizModel.js) | JavaScript | 75 | 4 | 7 | 86 |
| [backend/src/model/userModel.js](/backend/src/model/userModel.js) | JavaScript | 14 | 0 | 3 | 17 |
| [backend/src/routes/analyticsRouter.js](/backend/src/routes/analyticsRouter.js) | JavaScript | 16 | 0 | 5 | 21 |
| [backend/src/routes/attemptRouter.js](/backend/src/routes/attemptRouter.js) | JavaScript | 14 | 0 | 5 | 19 |
| [backend/src/routes/authRoute.js](/backend/src/routes/authRoute.js) | JavaScript | 8 | 0 | 3 | 11 |
| [backend/src/routes/quizRouter.js](/backend/src/routes/quizRouter.js) | JavaScript | 19 | 0 | 5 | 24 |
| [backend/src/routes/resultsRouter.js](/backend/src/routes/resultsRouter.js) | JavaScript | 12 | 3 | 5 | 20 |
| [backend/src/routes/usersRoute.js](/backend/src/routes/usersRoute.js) | JavaScript | 7 | 0 | 5 | 12 |
| [backend/src/server.js](/backend/src/server.js) | JavaScript | 12 | 0 | 3 | 15 |
| [backend/src/utils/analytics.js](/backend/src/utils/analytics.js) | JavaScript | 170 | 13 | 37 | 220 |
| [backend/src/utils/export.js](/backend/src/utils/export.js) | JavaScript | 154 | 17 | 28 | 199 |
| [backend/src/utils/genereateToken.js](/backend/src/utils/genereateToken.js) | JavaScript | 12 | 0 | 3 | 15 |
| [backend/src/utils/scoring.js](/backend/src/utils/scoring.js) | JavaScript | 105 | 4 | 24 | 133 |
| [frontend/README.md](/frontend/README.md) | Markdown | 7 | 0 | 6 | 13 |
| [frontend/eslint.config.js](/frontend/eslint.config.js) | JavaScript | 28 | 0 | 2 | 30 |
| [frontend/index.html](/frontend/index.html) | HTML | 13 | 0 | 1 | 14 |
| [frontend/package.json](/frontend/package.json) | JSON | 54 | 0 | 1 | 55 |
| [frontend/postcss.config.cjs](/frontend/postcss.config.cjs) | JavaScript | 6 | 0 | 1 | 7 |
| [frontend/public/errorimage.svg](/frontend/public/errorimage.svg) | XML | 1 | 0 | 0 | 1 |
| [frontend/public/vite.svg](/frontend/public/vite.svg) | XML | 1 | 0 | 0 | 1 |
| [frontend/src/App.css](/frontend/src/App.css) | PostCSS | 29 | 8 | 11 | 48 |
| [frontend/src/App.jsx](/frontend/src/App.jsx) | JavaScript JSX | 127 | 29 | 13 | 169 |
| [frontend/src/assets/react.svg](/frontend/src/assets/react.svg) | XML | 1 | 0 | 0 | 1 |
| [frontend/src/components/AuthForm.jsx](/frontend/src/components/AuthForm.jsx) | JavaScript JSX | 13 | 0 | 1 | 14 |
| [frontend/src/components/ConfidenceSlider.jsx](/frontend/src/components/ConfidenceSlider.jsx) | JavaScript JSX | 15 | 0 | 1 | 16 |
| [frontend/src/components/GuestRoute.jsx](/frontend/src/components/GuestRoute.jsx) | JavaScript JSX | 9 | 0 | 4 | 13 |
| [frontend/src/components/LatexRenderer.jsx](/frontend/src/components/LatexRenderer.jsx) | JavaScript JSX | 44 | 18 | 11 | 73 |
| [frontend/src/components/Navbar.jsx](/frontend/src/components/Navbar.jsx) | JavaScript JSX | 88 | 5 | 9 | 102 |
| [frontend/src/components/ProtectedRoute.jsx](/frontend/src/components/ProtectedRoute.jsx) | JavaScript JSX | 12 | 0 | 5 | 17 |
| [frontend/src/components/QuestionEditor.jsx](/frontend/src/components/QuestionEditor.jsx) | JavaScript JSX | 309 | 7 | 16 | 332 |
| [frontend/src/components/QuizCard.jsx](/frontend/src/components/QuizCard.jsx) | JavaScript JSX | 120 | 0 | 12 | 132 |
| [frontend/src/components/RoleRoute.jsx](/frontend/src/components/RoleRoute.jsx) | JavaScript JSX | 7 | 0 | 2 | 9 |
| [frontend/src/components/analytics/AnalyticsSummary.jsx](/frontend/src/components/analytics/AnalyticsSummary.jsx) | JavaScript JSX | 131 | 5 | 7 | 143 |
| [frontend/src/components/analytics/ConfidenceCalibration.jsx](/frontend/src/components/analytics/ConfidenceCalibration.jsx) | JavaScript JSX | 254 | 12 | 17 | 283 |
| [frontend/src/components/analytics/PerformanceDistribution.jsx](/frontend/src/components/analytics/PerformanceDistribution.jsx) | JavaScript JSX | 157 | 5 | 9 | 171 |
| [frontend/src/components/analytics/QuestionAnalytics.jsx](/frontend/src/components/analytics/QuestionAnalytics.jsx) | JavaScript JSX | 129 | 8 | 11 | 148 |
| [frontend/src/components/analytics/resultsTable.jsx](/frontend/src/components/analytics/resultsTable.jsx) | JavaScript JSX | 224 | 1 | 16 | 241 |
| [frontend/src/components/ui/LoadingSpinner.jsx](/frontend/src/components/ui/LoadingSpinner.jsx) | JavaScript JSX | 18 | 1 | 4 | 23 |
| [frontend/src/hooks/useQuiz.js](/frontend/src/hooks/useQuiz.js) | JavaScript | 15 | 0 | 4 | 19 |
| [frontend/src/index.css](/frontend/src/index.css) | PostCSS | 33 | 1 | 5 | 39 |
| [frontend/src/main.jsx](/frontend/src/main.jsx) | JavaScript JSX | 16 | 0 | 3 | 19 |
| [frontend/src/pages/AttemptResultPage.jsx](/frontend/src/pages/AttemptResultPage.jsx) | JavaScript JSX | 329 | 18 | 26 | 373 |
| [frontend/src/pages/JoinQuizPage.jsx](/frontend/src/pages/JoinQuizPage.jsx) | JavaScript JSX | 322 | 14 | 31 | 367 |
| [frontend/src/pages/Landing.jsx](/frontend/src/pages/Landing.jsx) | JavaScript JSX | 93 | 7 | 10 | 110 |
| [frontend/src/pages/NotFound.jsx](/frontend/src/pages/NotFound.jsx) | JavaScript JSX | 49 | 4 | 5 | 58 |
| [frontend/src/pages/PublicAttemptPlayer.jsx](/frontend/src/pages/PublicAttemptPlayer.jsx) | JavaScript JSX | 282 | 17 | 25 | 324 |
| [frontend/src/pages/TeacherAttemptsPage.jsx](/frontend/src/pages/TeacherAttemptsPage.jsx) | JavaScript JSX | 243 | 21 | 16 | 280 |
| [frontend/src/pages/auth/Login.jsx](/frontend/src/pages/auth/Login.jsx) | JavaScript JSX | 129 | 2 | 13 | 144 |
| [frontend/src/pages/auth/Register.jsx](/frontend/src/pages/auth/Register.jsx) | JavaScript JSX | 112 | 2 | 13 | 127 |
| [frontend/src/pages/teacher/AnalyticsDashboard.jsx](/frontend/src/pages/teacher/AnalyticsDashboard.jsx) | JavaScript JSX | 192 | 9 | 18 | 219 |
| [frontend/src/pages/teacher/Profile.jsx](/frontend/src/pages/teacher/Profile.jsx) | JavaScript JSX | 369 | 19 | 38 | 426 |
| [frontend/src/pages/teacher/QuizForm.jsx](/frontend/src/pages/teacher/QuizForm.jsx) | JavaScript JSX | 302 | 7 | 30 | 339 |
| [frontend/src/pages/teacher/QuizList.jsx](/frontend/src/pages/teacher/QuizList.jsx) | JavaScript JSX | 109 | 4 | 7 | 120 |
| [frontend/src/pages/teacher/TeacherDashboard.jsx](/frontend/src/pages/teacher/TeacherDashboard.jsx) | JavaScript JSX | 165 | 8 | 17 | 190 |
| [frontend/src/pages/teacher/TeacherQuizView.jsx](/frontend/src/pages/teacher/TeacherQuizView.jsx) | JavaScript JSX | 471 | 13 | 37 | 521 |
| [frontend/src/services/analyticsService.js](/frontend/src/services/analyticsService.js) | JavaScript | 24 | 5 | 4 | 33 |
| [frontend/src/services/api.js](/frontend/src/services/api.js) | JavaScript | 12 | 1 | 4 | 17 |
| [frontend/src/services/attemptService.js](/frontend/src/services/attemptService.js) | JavaScript | 37 | 1 | 9 | 47 |
| [frontend/src/services/authService.js](/frontend/src/services/authService.js) | JavaScript | 13 | 0 | 4 | 17 |
| [frontend/src/services/quizService.js](/frontend/src/services/quizService.js) | JavaScript | 33 | 0 | 8 | 41 |
| [frontend/src/services/resultsService.js](/frontend/src/services/resultsService.js) | JavaScript | 23 | 5 | 6 | 34 |
| [frontend/src/store/slices/attemptSlice.js](/frontend/src/store/slices/attemptSlice.js) | JavaScript | 43 | 0 | 5 | 48 |
| [frontend/src/store/slices/authSlice.js](/frontend/src/store/slices/authSlice.js) | JavaScript | 68 | 0 | 8 | 76 |
| [frontend/src/store/slices/quizSlice.js](/frontend/src/store/slices/quizSlice.js) | JavaScript | 45 | 0 | 5 | 50 |
| [frontend/src/store/store.js](/frontend/src/store/store.js) | JavaScript | 12 | 0 | 3 | 15 |
| [frontend/src/utils/latex.js](/frontend/src/utils/latex.js) | JavaScript | 5 | 0 | 1 | 6 |
| [frontend/src/utils/scoring.js](/frontend/src/utils/scoring.js) | JavaScript | 17 | 0 | 3 | 20 |
| [frontend/tailwind.config.cjs](/frontend/tailwind.config.cjs) | JavaScript | 48 | 1 | 1 | 50 |
| [frontend/vite.config.js](/frontend/vite.config.js) | JavaScript | 12 | 0 | 2 | 14 |
| [package.json](/package.json) | JSON | 15 | 0 | 1 | 16 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)