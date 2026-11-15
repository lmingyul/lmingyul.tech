---
title: "SpEL 的使用场景"
slug: "spring-spel-use-cases"
publishedAt: "2024-01-30T09:48:00.000Z"
categories:
  - "编程语言"
  - "Java"
description: "SpEL（Spring 表达式语言）用于在运行时解析表达式并生成值，常用于注解和 XML 配置中。核心概念包括解析器、表达式和上下文，支持记录操作日志等功能，通过注解和 AOP 实现日志记录。示例展示了如何使用 SpEL 处理请求参数和记录操作日志。"
cover: "/uploads/posts/spring-spel-use-cases/01-image.png"
readingTime: 3
mood: "neutral"
draft: false
id: "1fbb44d3-5440-8005-81bc-ed255ec2e442"
---
# 什么是 SpEL ?

> 是 Spring 表达式语言，可以在运行时对表达式进行解析并生成对应的值。SpEL 最常用于 Spring 中的注解和 XML 配置文件中的属性。

常见的例子：

```java
@Value("${request.url.check-chars}")
private String checkChars;

@Value("${SM4.uidKey:5KrOf8|Rq~Ih9q=,}")
private String uidKey = "";

```

更多的例子可以参考：[SpEL 表达式官网](https://docs.spring.io/spring-framework/reference/core/expressions.html)

---

# 核心概念及原理

## 核心概念

```java
public class SpELDemo {

    public static void main(String[] args) {
        // 解析器
        SpelExpressionParser parser = new SpelExpressionParser();
        // 表达式，#number 是用于读取 context 上下文中设置参数
        String expressionStr = "#number > 10 ? 'true' : 'false'";
        // 解析 SpEL 表达式
        Expression expression = parser.parseExpression(expressionStr);

        // 创建 StandardEvaluationContext 上下文对象
        StandardEvaluationContext context = new StandardEvaluationContext();
        // 在上下文中设置 number 这个参数为 9
        context.setVariable("number", 9);
        // 执行表达式，获取类型为 String 的对象
        String result = expression.getValue(context, String.class);
        System.out.println(result);
    }
}

```

- 解析器：将字符串表达式解析为表达式对象
- 表达式：表达需要干什么
- 上下文：表达式对象执行的环境。可以在这个环境中设置变量、定义函数、类型转换等

## 处理过程的原理

- 将给定的字符串解析成一个值中间需要经历：
  - 表达式解析（语法分析） ->上下文设置 -> 表达式求值 -> 结果返回
- 表达式解析：其实就是将字符串解析成一个抽象语法树（AST）
- 上下文设置：将需要传递的参数保存在上下文对象中，然后传递给表达式求值引擎，确保求值时可以操作上下文的数据
- 表达式求值：求值过程遵循 AST 结构，从根节点开始，逐级向下遍历并对每个节点进行求值。求值过程会涉及到递归操作

![](/uploads/posts/spring-spel-use-cases/01-image.png)

## @Value 注解的实现原理

![](/uploads/posts/spring-spel-use-cases/02-706image.png)

![](/uploads/posts/spring-spel-use-cases/03-732image.png)

---

# 常见的使用场景

## 使用 SpEL 记录操作日志

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface LogRecordBefore {

    /**
     * SpEL 模板表达式
     * 当前HandlerMethod的所有形参都会被放入到SpEL的Context，名称就是方法参数名称。
     * @return
     */
    String expression();
}

```

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface LogRecordAfter {

    /**
     * SpEL 模板表达式
     * 当前HandlerMethod的所有形参都会被放入到SpEL的Context，名称就是方法参数名称。
     * @return
     */
    String expression();
}

```

```java
@Aspect
@Component
@Order(-1)
@Slf4j
public class OperationLogAop {

    // 需要被SpEl解析的模板前缀和后缀 {{ expression  }}
    public static final TemplateParserContext TEMPLATE_PARSER_CONTEXT = new TemplateParserContext("{{", "}}");

    // SpEL解析器
    public static final ExpressionParser EXPRESSION_PARSER = new SpelExpressionParser();

    @Pointcut(value = "@annotation(com.cmbchina.annotation.LogRecordBefore)")
    public void controllerBefore() {
    }

    @Pointcut(value = "@annotation(com.cmbchina.annotation.LogRecordAfter)")
    public void controllerAfter() {
    }

    @Before(value = "controllerBefore()")
    public void actionLogBefore(JoinPoint joinPoint) throws Throwable {

        MethodSignature signature = (MethodSignature)joinPoint.getSignature();

        // 参数
        Object[] args = joinPoint.getArgs();

        // 参数名称
        String[] parameterNames = signature.getParameterNames();

        // 目标方法
        Method targetMethod = signature.getMethod();

        // 方法上的日志注解
        LogRecordBefore operationLog = targetMethod.getAnnotation(LogRecordBefore.class);

        // request
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();

        try {
            /**
             * SpEL解析的上下文，把 HandlerMethod 的形参都添加到上下文中，并且使用参数名称作为KEY
             */
            EvaluationContext evaluationContext = new StandardEvaluationContext();
            for (int i = 0; i < args.length; i++) {
                evaluationContext.setVariable(parameterNames[i], args[i]);
            }
            evaluationContext.setVariable("request", request);

            String logContent =
                    EXPRESSION_PARSER.parseExpression(operationLog.expression(), TEMPLATE_PARSER_CONTEXT).getValue(evaluationContext, String.class);

            log.info("operationLogBefore={}", logContent);
        } catch (Exception e) {
            log.error("操作日志 SpEL 表达式解析异常: {}", e.getMessage(), e);
        }
    }

    @AfterReturning(value = "controllerAfter()", returning = "retVal")
    public void actionLogAfter(JoinPoint joinPoint, Object retVal) throws Throwable {

        MethodSignature signature = (MethodSignature)joinPoint.getSignature();

        // 目标方法
        Method targetMethod = signature.getMethod();

        // 方法上的日志注解
        LogRecordAfter operationLog = targetMethod.getAnnotation(LogRecordAfter.class);

        try {
            /**
             * SpEL解析的上下文，把 HandlerMethod 的形参都添加到上下文中，并且使用参数名称作为KEY
             */
            EvaluationContext evaluationContext = new StandardEvaluationContext();
            evaluationContext.setVariable("result", retVal);

            String logContent =
                    EXPRESSION_PARSER.parseExpression(operationLog.expression(), TEMPLATE_PARSER_CONTEXT).getValue(evaluationContext, String.class);

            log.info("operationLogAfter={}", logContent);
        } catch (Exception e) {
            log.error("操作日志 SpEL 表达式解析异常: {}", e.getMessage(), e);
        }
    }
}

```

```java
/**
     * 智能推荐搜索接口
     *
     * @param searchParamVO 搜索参数对象
     * @return 结果 JSON 字符串
     */
    @UserPortrait
    @RequestMapping(value = "/search", produces = "application/json;charset=utf-8")
    @LogRecordBefore(expression = "智能推荐搜索入口"
            + ", userAgent = {{ #request.getHeader('User-Agent') }}"
            + ", action = {{ #request.getMethod() }}"
            + ", ip = {{ #request.getRemoteAddr() }}"
            + ", keyword = {{ #searchParamVO.keyword }}"
            + ", city = {{ #searchParamVO.city }}"
            + ", userid = {{ #searchParamVO.userid }}")
    @LogRecordAfter(expression = "智能推荐搜索返回"
            + ", results = {{ #result }}")
    public String search(@ModelAttribute SearchParamVO searchParamVO) {

        if (searchParamVO == null || StringUtils.isBlank(searchParamVO.getKeyword())) {
            return JSON.toJSONString(new ResponseModel("参数错误", false, null, null), true);
        }
        // 转换参数
        ParamModel paramModel = paramConverter.voToParamModel(searchParamVO);

        return searchService.search(paramModel);
    }

```

```java
20240131 11:23:31 [Root-INFO] operationLogBefore=智能推荐搜索入口, userAgent = PostmanRuntime/7.28.4, action = GET, ip = 0:0:0:0:0:0:0:1, keyword = 网点, city = 深圳, userid = 015207508459

```

```java
20240131 11:31:18 [Root-INFO] operationLogAfter=智能推荐搜索返回, results = {
	"content":[
		{
			"code":"16009002",
			"delete_time":"",
			"city":[
				"全部"
			],
			"description_highlight":"全部 <em>网点</em>",
			"description":"全部 网点",
			"source":{
			},
			"title":"网点预约",
			"type":"menu",
			"minitype":"dmpmenu",
			"path":"全部 网点",
			"score":12.954393,
			"jump_url":"http://cmbls/functionjump?action=gofuncid&funcid=16009002&clean=false&cmb_app_trans_parms_start=here&search_source_id=16009002",
			"subtype":"",
			"title_highlight":"<em>网点</em>预约",
			"id":"16009002",
			"spell":"wang dian yu yue",
			"os":"all",
			"recall_mode":9,
			"image_url":"https://static.m.cmbchina.com/MStatic/Res/client750/images/wdyy3x.png",
			"end_time":"2099-12-31 23:59:59",
			"merg_score":1.3334463468384472,
			"version":"1.0.0",
			"city_match":[],
			"start_time":"2020-06-10 00:00:00",
			"tinytype":"",
			"seo_word":"",
			"code_highlight":"16009002",
			"custom_description":"",
			"initial_spell":"wdyy"
		}
	],
	"extra":{
		"elg_inv_ind_dp":false,
		"show_fund_more":false
	},
	"message":"成功",
	"success":true
}

```
