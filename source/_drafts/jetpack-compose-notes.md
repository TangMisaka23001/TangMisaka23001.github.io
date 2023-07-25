---
title: Jetpack Compose快速入门笔记
mathjax: false
date: 2023-07-014 11:45:14
categories: [技术]
tags: [笔记, Android, Kotlin, Jetpack Compose]
---
## 前言
本文内容是基于视频[最快速的composeM3的MVI实战学习掌握](https://www.bilibili.com/video/BV1hh411T7ha/)的笔记整理。

## 项目创建
### project: 
`id("com.google.dagger.hilt.android") version "2.44" apply false`
### module:
```kotlin
plugins {
    ...
    kotlin("kapt")
    id("com.google.dagger.hilt.android")
}
```
    
```kotlin
dependencies {
    implementation("androidx.datastore:datastore-preferences-core:1.0.0")
    implementation("androidx.datastore:datastore-preferences:1.0.0")

    implementation("com.google.dagger:hilt-android:2.44")
    kapt("com.google.dagger:hilt-android-compiler:2.44")
    implementation("androidx.hilt:hilt-navigation-compose:1.0.0")

    implementation("androidx.navigation:navigation-compose:2.6.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.6.1")
...
```
### 目录结构
![](https://misakatang.oss-cn-beijing.aliyuncs.com/blog_picture/2023-07-18-fe2sFW.png)

## APP主题配色
[material官方主题色配置](https://m3.material.io/theme-builder#/custom)

### Color.kt
```kotlin
object LightColors {
    val primary = Color(0xFF6750A4)
    val onPrimary = Color(0xFFFFFFFF)
    val primaryContainer = Color(0xFFEADDFF4)
    val onPrimaryContainer = Color(0xFF21005D)
    val background = Color(0xFFFFFBFE)
}

object DarkColors {
    val primary = Color(0xFFD0BCFF)
    val onPrimary = Color(0xFF381E72)
    val primaryContainer = Color(0xFF4F378B)
    val onPrimaryContainer = Color(0xFFEADDFF)
    val background = Color(0xFF1C1B1F)
}
```

### theme.kt
```kotlin
private val DarkColorScheme = darkColorScheme(
    primary = DarkColors.primary,
    onPrimary = DarkColors.onPrimary,
    primaryContainer = DarkColors.primaryContainer,
    onPrimaryContainer = DarkColors.onPrimaryContainer,
    background = DarkColors.background,
)

private val LightColorScheme = lightColorScheme(
    primary = LightColors.primary,
    onPrimary = LightColors.onPrimary,
    primaryContainer = LightColors.primaryContainer,
    onPrimaryContainer = LightColors.onPrimaryContainer,
    background = LightColors.background,
)

.......


    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            // change
            window.statusBarColor = colorScheme.background.toArgb()
            // change
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

```

### kotlin知识点
#### object

## 导航
```kotlin
setContent {
    MyApplicationTheme {
        val appNavController = rememberNavController()
        NavHost(
            navController = appNavController,
            startDestination = AppRoute.START_SCREEN
        ) {
            composable(AppRoute.START_SCREEN) {
                StartPageView(appNavController)
            }
            composable(AppRoute.MAIN_NAV) {
                MainNavView()
            }
        }
    }
}
```

### 跳转
```kt
appNavController.navigate(AppRoute.MAIN_NAV)
```
## 启动页动画
```kotlin
@OptIn(ExperimentalAnimationApi::class)
@Composable
fun StartPageView(appNavController: NavHostController? = null) {
    val circleColor = MaterialTheme.colorScheme.primaryContainer
    val lineColor = MaterialTheme.colorScheme.onPrimaryContainer
    var contentVisible by remember {
        mutableStateOf(false)
    }
    var iconVisible by remember {
        mutableStateOf(false)
    }
    LaunchedEffect(Unit) {
        withContext(Dispatchers.IO) {
            delay(500)
            iconVisible = true
        }
        delay(2000)
        contentVisible = true
        delay(1000)
        appNavController?.navigate(AppRoute.MAIN_NAV)
    }
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        AnimatedVisibility(
            visible = iconVisible,
            enter = scaleIn()
        ) {
            Canvas(modifier = Modifier.size(100.dp)) {
                val offset = Offset(size.width / 2, size.height / 2)
                drawCircle(
                    color = circleColor,
                    radius = size.minDimension/2,
                    center= offset
                )
                drawLine(
                    color = lineColor,
                    start = offset,
                    end = Offset(size.width / 2, size.height / 2 + (size.height / 3)),
                    strokeWidth = 3.dp.toPx(),
                    cap = StrokeCap.Round
                )
            }
        }

        AnimatedVisibility(
            visible = contentVisible,
            enter = expandVertically(expandFrom = Alignment.Bottom)
                    + fadeIn(initialAlpha = 0.1f)
        ) {
            Text(text = "time manager master", fontWeight = FontWeight.Bold)
        }
    }
}

@Preview(showBackground = true)
@Composable
fun StartPagePreView() {
    MyApplicationTheme {
        StartPageView()
    }
}
```

## 导航页
```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainNavView() {

    val navList = listOf(
        Pair("home", R.drawable.home),
        Pair("count", R.drawable.count),
        Pair("clock", R.drawable.clock),
    )
    var activeIndex by remember {
        mutableStateOf(0)
    }
    val mainNavController = rememberNavController()
    mainNavController.addOnDestinationChangedListener { _, des, _ ->
        MainNavRoute.apply {
            when (des.route) {
                HOME -> {
                    activeIndex = 0
                }

                COUNTDOWN -> {
                    activeIndex = 1
                }

                STOP_WATCH -> {
                    activeIndex = 2
                }
            }
        }
    }
    Scaffold(modifier = Modifier.fillMaxSize(), bottomBar = {
        NavigationBar {
            navList.forEachIndexed { index, pair ->
                NavigationBarItem(
                    selected = activeIndex == index,
                    onClick = {
                        activeIndex = when (index) {
                            0 -> {
                                mainNavController.mainNavTo(MainNavRoute.HOME)
                                index
                            }

                            1 -> {
                                mainNavController.mainNavTo(MainNavRoute.COUNTDOWN)
                                index
                            }

                            2 -> {
                                mainNavController.mainNavTo(MainNavRoute.STOP_WATCH)
                                index
                            }

                            else -> {
                                -1
                            }
                        }

                    },
                    icon = {
                        Icon(
                            painter = painterResource(id = pair.second),
                            contentDescription = pair.first,
                            modifier = Modifier.size(25.dp),
                            tint = MaterialTheme.colorScheme.primary
                        )
                    },
                    label = {
                        Text(text = pair.first)
                    },
                    colors = NavigationBarItemDefaults.colors(
                        selectedTextColor = MaterialTheme.colorScheme.primary
                    ),
                )
            }
        }
    }) {
        Box(modifier = Modifier.padding(it)) {
            NavHost(navController = mainNavController, startDestination = MainNavRoute.HOME) {
                composable(MainNavRoute.HOME) {
                    HomeView()
                }
                composable(MainNavRoute.COUNTDOWN) {
                    CountDownView()
                }
                composable(MainNavRoute.STOP_WATCH) {
                    StopWatchView()
                }
            }
        }
    }
}

fun NavHostController.mainNavTo(route: String) {
    this.navigate(route) {
        popUpTo(this@mainNavTo.graph.findStartDestination().id)
        launchSingleTop = true
    }
}
```