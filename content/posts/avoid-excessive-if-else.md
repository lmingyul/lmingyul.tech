---
title: "避免写大量 if-else 的几种常用方式"
slug: "avoid-excessive-if-else"
publishedAt: "2024-01-17T03:32:00.000Z"
categories:
  - "编程语言"
  - "Java"
description: "介绍了避免大量 if-else 的几种方法，包括尽早返回、使用 switch 或三元运算符、Optional、枚举、策略模式、注册表和责任链模式，以提高代码的可读性和维护性。"
cover: "/uploads/covers/avoid-excessive-if-else.png"
readingTime: 4
mood: "neutral"
draft: false
id: "1fbb44d3-5440-8027-8024-f7c881a8eb09"
---
我们在写代码的时候难免会遇到比较复杂的条件，这个时候就容易写出非常多的 if-else ，或者出现不同的 if-else 嵌套层级很深。这样的代码阅读与维护起来都比较费时间和人力。所以我们在写代码的时候可以注意一下，使用一下比较常用的方式来避免出现这种情况。

# 方式一、尽早返回

```java
if (CollectionUtils.isNotEmpty(list)) {
	// do something
} else {
	return xxx;
}
```

```java
if (CollectionUtils.isEmpty(list)) {
	return xxx;
}

// do something
```

这种方式与集合中 fail-fast 机制有异曲同工的意思，具体在方法一开始入口就判断不合法的场景，如果不合法就直接返回。这样做的好处：省掉了一层 if 包裹

---

# 方式二、使用 switch 或者 三元运算符

```java
if (condition1) {
    doSomeThing1();
} else if (condition2) {
    doSomeThing2();
} else if (condition3) {
    doSomeThing3();
} else if (condition4) {
    doSomeThing4();
} else {
    doSomeThing5();
}...
```

```java
switch ("") {
	case condition1:
		doSomeThing1();
    case "":
        doSomeThing2();
}
```

---

# 方式三、Optional

if else 分支判断的很多情况都是进行非空条件的判断，Optional 是 Java8 开始提供的新特性，使用这个语法特性，也可以减少代码中if else 的数量，例如：

```java
String str = "Hello World!";

if (str != null) {
    System.out.println(str);
} else {
    System.out.println("Null");
}

```

```java
Optional<String> optional = Optional.of("Hello World!");
optional.ifPresentOrElse(System.out::println, () -> System.out.println("Null"));

```

# 方式四、枚举

```java
public int calculate(int a, int b, String operator) {
    int result = Integer.MIN_VALUE;

    if ("add".equals(operator)) {
        result = a + b;
    } else if ("multiply".equals(operator)) {
        result = a * b;
    } else if ("divide".equals(operator)) {
        result = a / b;
    } else if ("subtract".equals(operator)) {
        result = a - b;
    }
    return result;
}

```

```java
public enum Operator {
    ADD {
        @Override
        public int apply(int a, int b) {
            return a + b;
        }
    },
    MULTIPLY {
        @Override
        public int apply(int a, int b) {
            return a * b;
        }
    }
    // other operators

    public abstract int apply(int a, int b);

}

public int calculate(int a, int b, Operator operator) {
    return operator.apply(a, b);
}

public void whenCalculateUsingEnumOperator_thenReturnCorrectResult() {
    int result = calculate(3, 4, Operator.valueOf("ADD"));
    int result1 = calculate(3, 4, Operator.valueOf("MULTIPLY"));
}
```

---

# 方式五、策略模式

使用场景：

- 一个接口或抽象类的各个子类都是为了解决相同的问题，区分这些子类的只有方法实现的不同
- 代码中使用大量 if else 或大面积 switch case 来选择具体的子实现类

比如说我们会存在这种情况，根据前端不同的输入参数采用不同的返回策略

```java
if (apiType.contains("test")) {
	// ...
	return title;
} else if (apiType.contains("view")) {
	// ...
	return JSON.toJSONString(logMap, SerializerFeature.DisableCircularReferenceDetect);
} else if (apiType.contains("search")) {
	// ...
	ResponseModel response = new ResponseModel("成功", true, results, extra);
	return JSON.toJSONString(response, true);
} else {
	// ...
	return
}
```

```java
@FunctionalInterface
public interface ResultStrategy {
    String returnResult();
}
```

```java
private Map<String, ResultStrategy> getResultStrategyMap(...) {
    HashMap<String, ResultStrategy> resultStrategyMap = new HashMap<>(12);
    String keyword = param.getKeyword();

    resultStrategyMap.put("title", () -> {
        // ...
        return title;
    });

    resultStrategyMap.put("view", () -> {
        // ...
        return JSON.toJSONString(logMap, SerializerFeature.DisableCircularReferenceDetect);
    });

    resultStrategyMap.put("search", () -> defaultResultStrategy(...));

    return resultStrategyMap;
}

// 默认返回策略
private String defaultResultStrategy(...) {
    // ...
    ResponseModel response = new ResponseModel("成功", true, results, extra);
    return JSON.toJSONString(response, true);
}
```

```java
Map<String, ResultStrategy> map = getResultStrategyMap(...);
apiType = StringUtils.isBlank(apiType) ? "search" : apiType;
ResultStrategy strategy = map.getOrDefault(apiType, () -> defaultResultStrategy(...));
return strategy.returnResult();
```

---

# 方式六、注册表

这种方式和策略模式有相似之处，但注册表更自由，不需要提炼接口，只需要将自定义实现在注册表中注册即可。

```java
if (apiType.contains("test")) {
	// ...
	return
} else if (apiType.contains("view")) {
	// ...
	return
} else if (apiType.contains("search")) {
	// ...
	return ;
} else {
	// ...
	return
}
```

```java
Map<?, Function<?> action> actionMappings = new HashMap<>();
// When init
actionMappings.put(value1, (someParams) -> { doAction1(someParams)});
actionMappings.put(value2, (someParams) -> { doAction2(someParams)});
actionMappings.put(value3, (someParams) -> { doAction3(someParams)});

// Omit null judgment
actionMappings.get(param).apply(someParams);
```

---

# 方式七、责任链模式

```java
public void handle(request) {
    if (handlerA.canHandle(request)) {
        handlerA.handleRequest(request);
    } else if (handlerB.canHandle(request)) {
        handlerB.handleRequest(request);
    } else if (handlerC.canHandle(request)) {
        handlerC.handleRequest(request);
    }
}
```

```java
public interface SearchHandler {

    void setNextHandler(SearchHandler nextHandler);
}

public abstract class AbstractSearchHandler implements SearchHandler {

  protected SearchHandler next;

  public abstract void handleRequest(Request request);

  public void setNextHandler(SearchHandler next) { this.next = next; }
}

public class HandlerA extends AbstractSearchHandler {
  public void handleRequest(Request request) {
    if (canHandle(request)) doHandle(request);
    else if (next != null) next.handleRequest(request);
  }
}

public class HandlerB extends AbstractSearchHandler {
  public void handleRequest(Request request) {
    if (canHandle(request)) doHandle(request);
    else if (next != null) next.handleRequest(request);
  }
}

public void handle(request) {
  List<SearchHandler> handlersList = new ArrayList<>();
  if (!CollectionUtils.isEmpty(handlersList)) {
      for (int i = 0; i < handlersList.size() - 1; i++) {
          ISearchHandler searchHandlerBefore = handlersList.get(i);
          ISearchHandler searchHandlerAfter = handlersList.get(i + 1);
          searchHandlerBefore.setNextHandler(searchHandlerAfter);
      }
  }
  SearchHandler handler = handlersList.get(0);
  handler.handleRequest(request);
}

```
