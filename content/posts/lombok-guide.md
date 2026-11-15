---
title: "常用开发库 - Lombok工具库详解"
slug: "lombok-guide"
publishedAt: "2023-12-20T03:15:00.000Z"
categories:
  - "工具"
  - "Java"
  - "常用系列"
description: "Lombok是一个Java工具库，用于自动生成冗长的代码，如getter、setter和构造函数。尽管它能简化代码，但使用时需谨慎，避免破坏封装性和影响代码可读性，且需确保团队成员都安装相应插件以便协作开发。"
cover: "/uploads/covers/lombok-guide.png"
readingTime: 18
mood: "neutral"
draft: false
id: "1fbb44d3-5440-8082-9dd5-cdd04486474f"
---
> Lombok是一款非常实用Java工具，可用来帮助开发人员消除Java的冗长代码，尤其是对于简单的Java对象（POJO）。实际上我并不推荐使用Lombok（不主动使用它）, 但是因为它有着很大的使用量，我们仍然有必要掌握它，不仅知道如何使用和它解决的问题，还要知道它的坑。@pdai

## Lombok的引入

我们在构造类的时候通常都需要写下面这些方法:

- toString()方法
- hashCode() and equals()方法
- Getter and Setter 方法
- 构造函数

对于这些方法通常是重复的，而且是可以很容易地机械地生成的那种东西。

### 在引入Lombok之前我们是怎么做的

IDE中添加getter/setter, toString等代码，Lombok 可以帮我们自动生成这些方法，而且在字段属性修改之后也不用重新生成这些方法，Lombok 会在编译期间重新生成，免掉每次修改都有手动生成方法的繁琐

## Lombok的安装和使用

### Lombok官网

- [Lombok官网](https://projectlombok.org/)地址

### Lombok安装

### IDEA搜索Lombok插件

Settings -> Plugins -> 输入搜索 Lombok -> 点击 Install

### 通过依赖管理引入 Lombok 依赖

另外需要注意的是，在使用lombok注解的时候记得要导入lombok.jar包到工程，如果使用的是Maven的工程项目的话，要在其pom.xml中添加依赖如下

```xml
<!-- https://mvnrepository.com/artifact/org.projectlombok/lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.18.16</version>
    <scope>provided</scope>
</dependency>

```

### 常见 Lombok 注解说明

其他注解看[官网](https://projectlombok.org/features/all)

- val：用在局部变量前面，相当于将变量声明为final
- @NonNull：给方法参数增加这个注解会自动在方法内对该参数进行是否为空的校验，如果为空，则抛出NPE（NullPointerException）
- @Cleanup：自动管理资源，用在局部变量之前，在当前变量范围内即将执行完毕退出之前会自动清理资源，自动生成try-finally这样的代码来关闭流
- @Getter/@Setter：用在属性上，再也不用自己手写setter和getter方法了，还可以指定访问范围
- @ToString：用在类上，可以自动覆写toString方法，当然还可以加其他参数，例如@ToString(exclude=”id”)排除id属性，或者@ToString(callSuper=true, includeFieldNames=true)调用父类的toString方法，包含所有属性
- @EqualsAndHashCode：用在类上，自动生成equals方法和hashCode方法
- @NoArgsConstructor, @RequiredArgsConstructor and @AllArgsConstructor：用在类上，自动生成无参构造和使用所有参数的构造函数以及把所有+ @NonNull属性作为参数的构造函数，如果指定 `staticName = "of"` 参数，同时还会生成一个返回类对象的静态工厂方法，比使用构造函数方便很多
- @Data：注解在类上，相当于同时使用了@ToString、@EqualsAndHashCode、@Getter、@Setter和@RequiredArgsConstrutor这些注解，对于POJO类十分有用
- @Value：用在类上，是@Data的不可变形式，相当于为属性添加final声明，只提供getter方法，而不提供setter方法
- @Builder：用在类、构造器、方法上，为你提供复杂的builder APIs，让你可以像如下方式一样调用Person.builder().name("Adam Savage").city("San Francisco").job("Mythbusters").job("Unchained Reaction").build();更多说明参考Builder
- @SneakyThrows：自动抛受检异常，而无需显式在方法上使用throws语句
- @Synchronized：用在方法上，将方法声明为同步的，并自动加锁，而锁对象是一个私有的属性\$lock或\$LOCK，而java中的synchronized关键字锁对象是this，锁在this或者自己的类对象上存在副作用，就是你不能阻止非受控代码去锁this或者类对象，这可能会导致竞争条件或者其它线程错误
- @Getter(lazy=true)：可以替代经典的Double Check Lock样板代码
- @Log：根据不同的注解生成不同类型的log对象，但是实例名称都是log，有六种可选实现类
- @CommonsLog Creates log = org.apache.commons.logging.LogFactory.getLog(LogExample.class);
- @Log Creates log = java.util.logging.Logger.getLogger(LogExample.class.getName());
- @Log4j Creates log = org.apache.log4j.Logger.getLogger(LogExample.class);
- @Log4j2 Creates log = org.apache.logging.log4j.LogManager.getLogger(LogExample.class);
- @Slf4j Creates log = org.slf4j.LoggerFactory.getLogger(LogExample.class);
- @XSlf4j Creates log = org.slf4j.ext.XLoggerFactory.getXLogger(LogExample.class);

### Lombok代码示例

- val示例

```java
public static void main(String[] args) {
    val sets = new HashSet<String>();
    val lists = new ArrayList<String>();
    val maps = new HashMap<String, String>();
    //=>相当于如下
    final Set<String> sets2 = new HashSet<>();
    final List<String> lists2 = new ArrayList<>();
    final Map<String, String> maps2 = new HashMap<>();
}

```

- @NonNull示例

```java
public void notNullExample(@NonNull String string) {
    string.length();
}
//=>相当于
public void notNullExample(String string) {
    if (string != null) {
        string.length();
    } else {
        throw new NullPointerException("null");
    }
}

```

- @Cleanup示例

```java
public static void main(String[] args) {
    try {
        @Cleanup InputStream inputStream = new FileInputStream(args[0]);
    } catch (FileNotFoundException e) {
        e.printStackTrace();
    }
    //=>相当于
    InputStream inputStream = null;
    try {
        inputStream = new FileInputStream(args[0]);
    } catch (FileNotFoundException e) {
        e.printStackTrace();
    } finally {
        if (inputStream != null) {
            try {
                inputStream.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}

```

- @Getter/@Setter示例

```java
@Setter(AccessLevel.PUBLIC)
@Getter(AccessLevel.PROTECTED)
private int id;
private String shape;

```

- @ToString示例

```java
@ToString(exclude = "id", callSuper = true, includeFieldNames = true)
public class LombokDemo {
    private int id;
    private String name;
    private int age;
    public static void main(String[] args) {
        //输出LombokDemo(super=LombokDemo@48524010, name=null, age=0)
        System.out.println(new LombokDemo());
    }
}

```

- @EqualsAndHashCode示例

这个把 id 和 shape 这 2 个 字段排除掉，callSuper = false 代表不调用父类的 equals 和 hashCode 方法

```java
@EqualsAndHashCode(exclude = {"id", "shape"}, callSuper = false)
public class LombokDemo {
    private int id;
    private String shape;
}

```

- @NoArgsConstructor, @RequiredArgsConstructor and @AllArgsConstructor示例

```java
@NoArgsConstructor
@RequiredArgsConstructor(staticName = "of")
@AllArgsConstructor
public class LombokDemo {
    @NonNull
    private int id;
    @NonNull
    private String shape;
    private int age;
    public static void main(String[] args) {
        // 正常构建一个对象
        new LombokDemo(1, "circle");
        //使用静态工厂方法
        LombokDemo.of(2, "circle");
        //无参构造
        new LombokDemo();
        //包含所有参数
        new LombokDemo(1, "circle", 2);
    }
}

```

- @Data示例

```java
import lombok.Data;
@Data
public class Menu {
    private String shopId;
    private String skuMenuId;
    private String skuName;
    private String normalizeSkuName;
    private String dishMenuId;
    private String dishName;
    private String dishNum;
    //默认阈值
    private float thresHold = 0;
    //新阈值
    private float newThresHold = 0;
    //总得分
    private float totalScore = 0;
}

```

- @Value示例

```java
@Value
public class LombokDemo {
    @NonNull
    private int id;
    @NonNull
    private String shap;
    private int age;
    //相当于
    private final int id;
    public int getId() {
        return this.id;
    }
    ...
}

```

- @Builder示例

```java
@Builder
public class BuilderExample {
    private String name;
    private int age;
    private Set<String> occupations;
    public static void main(String[] args) {
        LombokDemo3 test = LombokDemo3.builder().age(11).name("test")
                .occupation("1")
                .build();
    }
}

```

- Builder.Default

```java
@Builder
@ToString
public class BuilderDefaultExample {

    @Builder.Default
    private final String id = UUID.randomUUID().toString();

    private String username;

    @Builder.Default
    private long insertTime = System.currentTimeMillis();

}

```

- @SneakyThrows示例

```java
import lombok.SneakyThrows;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
public class Test {
    @SneakyThrows()
    public void read() {
        InputStream inputStream = new FileInputStream("");
    }
    @SneakyThrows
    public void write() {
        throw new UnsupportedEncodingException();
    }
    //相当于
    public void read() throws FileNotFoundException {
        InputStream inputStream = new FileInputStream("");
    }
    public void write() throws UnsupportedEncodingException {
        throw new UnsupportedEncodingException();
    }
}

```

- @Synchronized示例

```java
public class SynchronizedDemo {
    @Synchronized
    public static void hello() {
        System.out.println("world");
    }
    //相当于
    private static final Object $LOCK = new Object[0];
    public static void hello() {
        synchronized ($LOCK) {
            System.out.println("world");
        }
    }
}

```

- @Getter(lazy = true)示例

```java
public class GetterLazyExample {
    @Getter(lazy = true)
    private final double[] cached = expensive();
    private double[] expensive() {
        double[] result = new double[1000000];
        for (int i = 0; i < result.length; i++) {
            result[i] = Math.asin(i);
        }
        return result;
    }
}

// 相当于如下所示:

import java.util.concurrent.atomic.AtomicReference;
public class GetterLazyExample {
    private final AtomicReference<java.lang.Object> cached = new AtomicReference<>();
    public double[] getCached() {
        java.lang.Object value = this.cached.get();
        if (value == null) {
            synchronized (this.cached) {
                value = this.cached.get();
                if (value == null) {
                    final double[] actualValue = expensive();
                    value = actualValue == null ? this.cached : actualValue;
                    this.cached.set(value);
                }
            }
        }
        return (double[]) (value == this.cached ? null : value);
    }
    private double[] expensive() {
        double[] result = new double[1000000];
        for (int i = 0; i < result.length; i++) {
            result[i] = Math.asin(i);
        }
        return result;
    }
}

```

## Lombok深入理解

### Lombok的原理

> 会发现在Lombok使用的过程中，只需要添加相应的注解，无需再为此写任何代码。自动生成的代码到底是如何产生的呢？

核心之处就是对于注解的解析上。以 @Data 注解为例，可以先看一下 @Data  的源码

```java
package lombok;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Generates getters for all fields, a useful toString method, and hashCode and equals implementations that check
 * all non-transient fields. Will also generate setters for all non-final fields, as well as a constructor.
 * <p>
 * Equivalent to {@code @Getter @Setter @RequiredArgsConstructor @ToString @EqualsAndHashCode}.
 * <p>
 * Complete documentation is found at <a href="https://projectlombok.org/features/Data">the project lombok features page for &#64;Data</a>.
 *
 * @see Getter
 * @see Setter
 * @see RequiredArgsConstructor
 * @see ToString
 * @see EqualsAndHashCode
 * @see lombok.Value
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.SOURCE)
public @interface Data {
	/**
	 * If you specify a static constructor name, then the generated constructor will be private, and
	 * instead a static factory method is created that other classes can use to create instances.
	 * We suggest the name: "of", like so:
	 *
	 * <pre>
	 *     public @Data(staticConstructor = "of") class Point { final int x, y; }
	 * </pre>
	 *
	 * Default: No static constructor, instead the normal constructor is public.
	 *
	 * @return Name of static 'constructor' method to generate (blank = generate a normal constructor).
	 */
	String staticConstructor() default "";
}

```

JDK5 引入了注解的同时提供了两种主要的解析方式：运行时解析、编译时解析，而 Lombok 就是利用了**编译时解析**的原理实现的

- **运行时解析**

运行时能够解析的注解，必须将@Retention设置为RUNTIME, 比如@Retention(RetentionPolicy.RUNTIME)，这样就可以通过反射拿到该注解。java.lang,reflect反射包中提供了一个接口AnnotatedElement，该接口定义了获取注解信息的几个方法，Class、Constructor、Field、Method、Package等都实现了该接口，对反射熟悉的朋友应该都会很熟悉这种解析方式。

- **编译时解析**

Lombok 就属于编译时解析，在编译期间它产生作用的具体流程如下：

- javac对源代码进行分析，生成了一棵抽象语法树（AST）
- 运行过程中调用实现了“JSR 269 API”的Lombok程序
- 此时Lombok就对第一步骤得到的AST进行处理，找到@Data注解所在类对应的语法树（AST），然后修改该语法树（AST），增加getter和setter方法定义的相应树节点
- javac使用修改后的抽象语法树（AST）生成字节码文件，即给class增加新的节点（代码块）

![](/uploads/posts/lombok-guide/01-image.png)

从上面的Lombok执行的流程图中可以看出，在Javac 解析成AST抽象语法树之后, Lombok 根据自己编写的注解处理器，动态地修改 AST，增加新的节点（即Lombok自定义注解所需要生成的代码），最终通过分析生成JVM可执行的字节码Class文件。使用Annotation Processing自定义注解是在编译阶段进行修改。

### 文本 -> 抽象语法树的过程

- 词法分析：文本 -> token列表
  - 去除空格，对token分类，去除空格，然后对token分类，哪些属于语法关键字，哪些属于操作符，哪些属于语句的截止位置，哪些属于数据
- 语法分析：token列表 -> 语法二叉树
  - 扫描token流，然后分析它的语法，这一步应该是分析一条以分号 ; 结尾的语句具体的执行规则，然后使用逆波兰表达式组合，最后形成一个二叉树，二叉树从底部往上一步步合并

AST 语法树具体展现，而且可以看出 Java 在解析语法树的时候是从左向右进行解析的

![](/uploads/posts/lombok-guide/02-777image.png)

到这里已经知道 Java 是怎么从文本解析成语法树的了，但是 Lombok 如何解析修改语法树的原理还不清楚，所以这里我们可以自己实现自己的注解来理解它的原理

首先修改一下 pom.xml 文件引入的 tools 工具

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.cmb</groupId>
    <artifactId>demo</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>com.sun</groupId>
            <artifactId>tools</artifactId>
            <version>1.8</version>
            <scope>system</scope>
            <systemPath>${java.home}/../lib/tools.jar</systemPath>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.6</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.1</version>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>

```

定义自己的注解类

```java
package com.cmb;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 代表注解只在源码中保留 ——> @Retention(RetentionPolicy.SOURCE)
 * 代表注解是修饰类的 ——> @Target(ElementType.TYPE)
 */
@Retention(RetentionPolicy.SOURCE)
@Target(ElementType.TYPE)
public @interface MySetterGetter {
}

```

定义一个实体类加上我们自己的注解

```java
@MySetterGetter
public class Test {

    private String userID;

    private String userName;

    private Integer age;
}

```

定义自己的语法树解析器

```java
package com.cmb;

import com.sun.source.tree.Tree;
import com.sun.tools.javac.api.JavacTrees;
import com.sun.tools.javac.code.Flags;
import com.sun.tools.javac.processing.JavacProcessingEnvironment;
import com.sun.tools.javac.tree.JCTree;
import com.sun.tools.javac.tree.TreeMaker;
import com.sun.tools.javac.tree.TreeTranslator;
import com.sun.tools.javac.util.Context;
import com.sun.tools.javac.util.List;
import com.sun.tools.javac.util.ListBuffer;
import com.sun.tools.javac.util.Name;
import com.sun.tools.javac.util.Names;

import javax.annotation.processing.AbstractProcessor;
import javax.annotation.processing.Messager;
import javax.annotation.processing.ProcessingEnvironment;
import javax.annotation.processing.RoundEnvironment;
import javax.annotation.processing.SupportedAnnotationTypes;
import javax.annotation.processing.SupportedSourceVersion;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.tools.Diagnostic;
import java.util.Set;

/**
 * 继承实现抽象的注解处理器 AbstractProcessor，重写 process、init 方法
 * 我们需要监听的注解 ——> @SupportedAnnotationTypes("com.cmb.MySetterGetter")
 * 我们需要对哪个版本的 Java 源代码进行处理 ——> @SupportedSourceVersion(SourceVersion.RELEASE_8)
 *
 *
 * @author 80372617
 * @date 2023/12/20
 */
@SupportedAnnotationTypes("com.cmb.MySetterGetter")
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class MySetterGetterProcessor extends AbstractProcessor {

    /**
     * Messager主要是用来在编译期打log用的
     */
    private Messager messager;
    /**
     * 提供了待处理的抽象语法树
     */
    private JavacTrees trees;
    /**
     * 封装了创建AST节点的一些方法
     */
    private TreeMaker treeMaker;
    /**
     * 提供了创建标识符的方法
     */
    private Names names;

    @Override
    public synchronized void init(ProcessingEnvironment processingEnv) {
        super.init(processingEnv);
        this.messager = processingEnv.getMessager();
        this.trees = JavacTrees.instance(processingEnv);
        Context context = ((JavacProcessingEnvironment)processingEnv).getContext();
        this.treeMaker = TreeMaker.instance(context);
        this.names = Names.instance(context);
    }

    @Override
    public boolean process(final Set<? extends TypeElement> annotations, final RoundEnvironment roundEnv) {
        // 拿到被 MySetterGetter 注解标注的所有的类
        Set<? extends Element> set = roundEnv.getElementsAnnotatedWith(MySetterGetter.class);
        // 遍历所有被 MySetterGetter 注解标注的所有的类，获取及修改语法树
        set.forEach(element -> {
            // 获取这个类的语法树
            JCTree jcTree = trees.getTree(element);
            jcTree.accept(new TreeTranslator() {
                @Override
                public void visitClassDef(JCTree.JCClassDecl jcClassDecl) {
                    List<JCTree.JCVariableDecl> jcVariableDeclList = List.nil();
                    // 在语法树中找出所有的这个类定义好的所有变量
                    for (JCTree tree : jcClassDecl.defs) {
                        if (tree.getKind().equals(Tree.Kind.VARIABLE)) {
                            JCTree.JCVariableDecl jcVariableDecl = (JCTree.JCVariableDecl) tree;
                            jcVariableDeclList = jcVariableDeclList.append(jcVariableDecl);
                        }
                    }
                    // 遍历所有变量树的列表
                    jcVariableDeclList.forEach(jcVariableDecl -> {
                        // 打印获取到了哪些变量
                        messager.printMessage(Diagnostic.Kind.NOTE, jcVariableDecl.getName() + " has been processed");
                        // 通过对每个变量调用 makeGetterMethodDecl 方法生成对应的 getter 、 setter 方法
                        jcClassDecl.defs = jcClassDecl.defs.prepend(makeGetterMethodDecl(jcVariableDecl));
                    });
                    super.visitClassDef(jcClassDecl);
                }

            });
        });
        // 返回 true，说明类结构变了，需要重新解析。如果是false说明没有变，不用重新解析。
        return true;
    }

    /**
     * 生成 getter 方法
     */
    private JCTree.JCMethodDecl makeGetterMethodDecl(JCTree.JCVariableDecl jcVariableDecl){
        ListBuffer<JCTree.JCStatement> statements = new ListBuffer<>();
        // 生成表达式
        JCTree.JCReturn aReturn = treeMaker.Return(treeMaker.Ident(jcVariableDecl.getName()));
        statements.append(aReturn);
        JCTree.JCBlock block = treeMaker.Block(0, statements.toList());
        // 无入参
        // 生成返回对象
        JCTree.JCExpression returnType = treeMaker.Type(jcVariableDecl.getType().type);
        return treeMaker.MethodDef(treeMaker.Modifiers(Flags.PUBLIC), getNewGetterMethodName(jcVariableDecl.getName()), returnType, List.nil(), List.nil(), List.nil(), block, null);
    }
    /**
     * 拼装Setter方法名称字符串
     */
    private Name getNewSetterMethodName(Name name) {
        String s = name.toString();
        return names.fromString("set" + s.substring(0,1).toUpperCase() + s.substring(1, name.length()));
    }
    /**
     * 拼装 Getter 方法名称的字符串
     */
    private Name getNewGetterMethodName(Name name) {
        String s = name.toString();
        return names.fromString("get" + s.substring(0,1).toUpperCase() + s.substring(1, name.length()));
    }

    /**
     * 生成表达式
     */
    private JCTree.JCExpressionStatement makeAssignment(JCTree.JCExpression lhs, JCTree.JCExpression rhs) {
        return treeMaker.Exec(
                treeMaker.Assign(lhs, rhs)
        );
    }

    private Name getNewMethodName(Name name) {
        String s = name.toString();
        return names.fromString("get" + s.substring(0, 1).toUpperCase() + s.substring(1, name.length()));
    }
}

```

### Lombok类似原理工具有什么

- 还有一些其它类库使用这种方式实现，比如:
  - [Google Auto](https://github.com/google/auto)
  - Dagger
  - ...

## Lombok有什么坑

### @Data的坑

- 在使用Lombok过程中，如果对于各种注解的底层原理不理解的话，很容易产生意想不到的结果。举一个简单的例子，我们知道，当我们使用@Data定义一个类的时候，会自动帮我们生成equals()方法 。但是如果只使用了@Data，而不使用@EqualsAndHashCode(callSuper=true)的话，会默认是@EqualsAndHashCode(callSuper=false), 这时候生成的 equals() 方法只会比较子类的属性，不会考虑从父类继承的属性，无论父类属性访问权限是否开放。这就可能得到意想不到的结果。
- 而且 如果我们在代码中直接使用 @Data，那么他会自动帮我们生成 getter、setter 等方法，这就意味着，一个类中的所有参数都自动提供了设置和读取方法。这样就破坏了类的封装性，所以我们尽量不要直接使用 @Data ,可以针对需要字段单独设置或者整个类上加上 @Getter 和 @Setter 方法

### 代码可读性，可调试性低

在代码中使用了Lombok，确实可以帮忙减少很多代码，因为Lombok会帮忙自动生成很多代码。但是**这些代码是要在编译阶段才会生成的**，所以在开发的过程中，其实很多代码其实是缺失的。在代码中大量使用Lombok，就导致代码的可读性会低很多，而且也会给代码调试带来一定的问题。 比如，我们想要知道某个类中的某个属性的getter方法都被哪些类引用的话，就没那么简单了。

### Lombok有很强的侵入性

- **一旦团队中有一个同事使用了，团队其他同事都进行安装插件并导入依赖使用**

因为Lombok的使用要求开发者一定要在IDE中安装对应的插件。如果未安装插件的话，使用IDE打开一个基于Lombok的项目的话会提示找不到方法等错误。导致项目编译失败。也就是说，如果项目组中有一个人使用了Lombok，那么其他人就必须也要安装IDE插件。否则就没办法协同开发。更重要的是，如果我们定义的一个jar包中使用了Lombok，那么就要求所有依赖这个jar包的所有应用都必须安装插件，这种侵入性是很高的。

- **影响升级**

因为Lombok对于代码有很强的侵入性，就可能带来一个比较大的问题，那就是会影响我们对JDK的升级。按照如今JDK的升级频率，每半年都会推出一个新的版本，但是Lombok作为一个第三方工具，并且是由开源团队维护的，那么他的迭代速度是无法保证的。所以，如果我们需要升级到某个新版本的JDK的时候，若其中的特性在Lombok中不支持的话就会受到影响。还有一个可能带来的问题，就是Lombok自身的升级也会受到限制。因为一个应用可能依赖了多个jar包，而每个jar包可能又要依赖不同版本的Lombok，这就导致在应用中需要做版本仲裁，而我们知道，jar包版本仲裁是没那么容易的，而且发生问题的概率也很高。

## 总结

- 优缺点
  - 优点：大大减少了代码量，使代码非常简洁
  - 缺点：可能存在对队友不友好、对代码不友好、对调试不友好、对升级不友好等问题。Lombok还会导致破坏封装性的问题。@Data中覆盖equals和hashCode的坑等。
- 什么样的情况使用Lombok
  - 团队整体的共识，IDE规范，相关代码规范等
  - 对Lombok足够了解，比如知道其中的坑等
- 不推荐使用Lombok的理由
  - 其实我们不缺时间写Getter和Setter的，这些代码通常是由IDE生成的。简化也是有代价的。
  - 对Lombok认知不够，导致带来的坑。
  - Java14中Record了解下。

## 参考文章

- [https://projectlombok.org/](https://projectlombok.org/)
- [http://blog.itpub.net/69908877/viewspace-2676272/](http://blog.itpub.net/69908877/viewspace-2676272/)
- [https://www.jianshu.com/p/63038c7c515a](https://www.jianshu.com/p/63038c7c515a)
- [https://www.cnblogs.com/heyonggang/p/8638374.html](https://www.cnblogs.com/heyonggang/p/8638374.html)
- [http://blog.didispace.com/java-lombok-how-to-use](http://blog.didispace.com/java-lombok-how-to-use)
