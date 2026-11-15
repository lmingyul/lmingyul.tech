---
title: "最好只做一次的操作"
slug: "idempotent-once-operations"
publishedAt: "2024-06-05T02:08:00.000Z"
categories:
  - "编程语言"
  - "Java"
description: "在Java程序中，某些操作如Pattern对象的创建、线程池的初始化和常量的定义应仅执行一次，以提高性能和减少资源消耗。可以通过静态变量、静态代码块或Spring Bean等方式实现这些操作的单次执行。"
cover: "/uploads/posts/idempotent-once-operations/01-image.png"
readingTime: 5
mood: "neutral"
draft: false
id: "1fcb44d3-5440-8017-a052-dc46724ed9d2"
---
> 在 Java 程序中存在很多只需做一次的操作，如果只在程序的启动的时候只做一次，可以省掉很多不必要的操作，提高程序的运行性能

## 什么操作适合只做一次

- 在整个服务系统生命周期内都不会发生改变
- 操作一次的成本很高，消耗系统性能

## 有哪些建议只做一次的操作

### Pattern 对象

Pattern 对象的新建的成本很高，如果每次在进行正则表达式的解析时都新建一次 Pattern 对象，会影响程序运行速度。

### 反例一

```java
boolean flag = str.matches("[0-9a-zA-z]+")
```

每次调用都会新建一个  Pattern 对象，而每次新建都会存在字符串的编译解析，涉及很多数组的申请和释放操作

![](/uploads/posts/idempotent-once-operations/01-image.png)

![](/uploads/posts/idempotent-once-operations/02-image-1.png)

### 反例二

```java
str.replaceAll("[\\\\u4e00-\\\\u9fa5]+", "")
```

底层依旧是新建了一个 Pattern 对象

![](/uploads/posts/idempotent-once-operations/03-image-2.png)

### 正例

可以将一下常用的正则表达式定义为静态变量，在程序启动时只初始化一次

```java
// 正例一
private static final Pattern pattern1 = Pattern.compile("[0-9a-zA-z]+");
boolean flag = pattern1.matcher(str).matches();

// 正例二
private static final Pattern pattern2 = Pattern.compile("[\\\\u4e00-\\\\u9fa5]+");
pattern2.matcher(str).replaceAll("")
```

注意：这里建议使用 `pattern.matcher(str).matches()` 来做判断，matches 方法针对全字符串匹配做了优化，通常比 `pattern.matcher(str).find()` 更高效，不需要在字符串中进行多次查找。

### 线程池对象

创建和销毁线程的开销很大，所以建立和创建线程池的开销也是同理，所以一般在程序启动的时候初始化一次。

```java
// 示例一
@Bean(name = "bizExecutor")
public ThreadPoolTaskExecutor asyncServiceExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
}

// 示例二
private static final ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
```

### 通用的常量

可以将一次常用的字符串或者配置单独放在一个常量类中，供全局使用，避免在运行时重复创建

```java
public class Constants {

    public static final String ALL = "all";
    public static final String OS_IPHONE = "iphone";
    public static final String OS_ANDROID = "android";
    public static final String DEFAULT_OS = OS_IPHONE;
    public static final String DEFAULT_CITY = "火星";
    public static final String SHENZHEN = "深圳";
    public static final String DEFAULT_VERSION = "7.4.0";
    public static final String EIGHT_VERSION = "8.0.0";
    public static final String STR_ZERO = "0";
    public static final String STR_ONE = "1";
    public static final String DEFAULT_PAGE_SIZE = "4";
    public static final String STR_TEN = "10";
    public static final String UTF_8 = "UTF-8";
    public static final String TEXT_JSON = "text/json";

    // ********** 常用文字常量 **********
    public static final String APPLICATION_JSON_UTF_8 = "application/json;charset=UTF-8";
    public static final String BIZ_EXECUTOR = "bizExecutor";
    public static final String SUCCESS = "success";
    public static final String CODE = "code";
    public static final String RESULT = "result";
    public static final String DATA = "data";
    public static final String COMMA = ",";
    public static final String STOCK = "stock";
    public static final String PRODUCT = "product";
    public static final String STR_FALSE = "false";
    public static final String ASC = "asc";
    public static final String TITLE = "title";
    public static final String CITY = "city";
    public static final String ID = "id";

    // ********** 数字常量 **********
    public static final double ZERO_DOT_FIVE_D = 0.5D;
    public static final int ZERO = 0;
    public static final int ONE = 1;
    public static final int TWO = 2;
    public static final int THREE = 3;
    public static final int FOUR = 4;
    public static final int EIGHT = 8;
    public static final int TEN = 10;
    public static final int SIXTEEN = 16;
    public static final int TWENTY = 20;
    public static final int THIRTY = 30;
    public static final int ONE_HUNDRED = 100;
    public static final int FIVE_HUNDRED = 500;
    public static final int ONE_THOUSAND = 1000;
    public static final int FIVE_THOUSAND = 5000;

    // ********** 远程调用返回码常量 **********
    public static final String RPC_MOVIE_SUCCEED_CODE = "0000";
    public static final String RPC_MOVIE_DETAIL_SUCCEED_CODE = "SUC0000";

    private Constants() {
        super();
    }
}

```

### 配置文件的读取

```java
public class ConfigManager {
    private static final Properties CONFIG;

    static {
        CONFIG = new Properties();
        try (InputStream input = new FileInputStream("config.properties")) {
            CONFIG.load(input);
        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }

    public static String getProperty(String key) {
        return CONFIG.getProperty(key);
    }
}
```

### 日志对象的初始化

```java
public class LogManager {
    private static final Logger LOGGER = LoggerFactory.getLogger(LogManager.class);

    public static void logInfo(String message) {
        LOGGER.info(message);
    }

    public static void logError(String message, Throwable throwable) {
        LOGGER.error(message, throwable);
    }
}
```

## 如何只做一次

### 定义为静态变量

```java
private static final ThreadLocal<List<String>> VECTOR_RECOMMEND_WORD_THREAD_LOCAL = new ThreadLocal<>();
```

### 使用静态代码块进行初始化

```java
static {
    // 加载日志配置文件
    LoggerFactory.load();
}
```

### 定义为 Spring 的 Bean 对象

由 Spring 容器来创建和管理，在程序启动时只会执行一次

```java
@Bean(name = "bizExecutor")
public ThreadPoolTaskExecutor asyncServiceExecutor() {

    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

    // 配置核心线程数
    executor.setCorePoolSize(corePoolSize);
}

```

### 使用 @PostConstruct 注解

被 @PostConstruct 注解修饰的方法会在依赖注入完之后自动被调用（即在构造方法执行之后）

```java
@PostConstruct
public void getPinYin() {
    // 加载拼音字典
    PinyinUtil.instance.load();
}

```

### 设置为单例对象

```java
public class Singleton {
    private static final Singleton INSTANCE = new Singleton();

    private Singleton() {
        // Private constructor to prevent instantiation
    }

    public static Singleton getInstance() {
        return INSTANCE;
    }
}

```
