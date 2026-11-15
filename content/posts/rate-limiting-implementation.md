---
title: "限流的实现"
slug: "rate-limiting-implementation"
publishedAt: "2024-02-28T07:36:00.000Z"
categories:
  - "系统设计"
  - "Java"
description: "限流是控制请求速率以保护系统的措施，常见算法包括计数器、固定窗口、滑动窗口、漏桶和令牌桶。限流可以基于IP、业务ID或调用关系进行，单机和分布式限流的实现方式各有不同，后者通常依赖于中心化组件如Redis。令牌桶算法因其灵活性和应对突发流量的能力而被广泛使用。"
cover: "/uploads/posts/rate-limiting-implementation/01-794image.png"
readingTime: 11
mood: "neutral"
draft: false
id: "1fbb44d3-5440-8033-99b6-e10efe0db68f"
---
# 什么是限流

限流就是对请求的速率进行限制，用于保护系统免，避免瞬间的大量请求击垮软件系统。基本原理就是通过控制请求的速率或数量，确保请求数在系统可承受的范围内。

# 为什么要限流

因为软件系统的处理能力是有限的。如果说短时间内访问系统的请求超过了系统的处理能力范围，软件系统可能直接就挂掉了，对业务造成影响。

# 常见限流的算法

## 计数器算法（简单）

将系统请求进行计数，设定系统限流的阈值，有请求过来就将计数器加 1，请求响应后就将请求减 1，每次请求都与限流阈值作对比，如果大于阈值就进行限流。这种算法比较简单，但是无法应对突发流量的情况。

## 固定窗口算法

固定窗口其实就是时间窗口。相比计数器算法，**固定窗口算法** 额外加入了时间的概念，规定了单位时间处理的请求数量。

假如我们规定系统中某个接口 1 分钟只能访问 100 次的话，使用固定窗口算法的实现思路如下：

- 给定一个变量 `counter` 来记录当前接口处理的请求数量，初始值为 0（代表接口当前 1 分钟内还未处理请求）。
- 1 分钟之内每处理一个请求之后就将 `counter+1` ，当 `counter=100` 之后（也就是说在这 1 分钟内接口已经被访问 100 次的话），后续的请求就会被全部拒绝。
- 等到 1 分钟结束后，将 `counter` 重置 0，重新开始计数。

**优缺点：**

- **优点**: 算法简单，易于实现和理解
- **缺点**：
  - 这种限流算法限流不够平滑。例如，当请求不是均匀分布时，如果我们限制某个接口每分钟只能访问 30 次，假设前 30 秒就有 30 个请求到达的话，那后续 30 秒将无法处理请求！
  - 除此之外，这种限流算法无法保证限流速率，因而无法应对突然激增的流量。例如，我们限制某个接口 1 分钟只能访问 1000 次，该接口的 QPS 为 500，前 55s 这个接口 1 个请求没有接收，后 1s 突然接收了 1000 个请求。然后，在当前场景下，这 1000 个请求在 1s 内是没办法被处理的，系统直接就被瞬时的大量请求给击垮了。

## 滑动窗口算法

**滑动窗口算法** 算的上是固定窗口算法的升级版。

滑动窗口算法相比于固定窗口算法的优化在于：**它把时间以一定比例分片** 。分别记录每个分片内请求数，并根据时间滑动删除过期的分片请求数，可以解决固定窗口的问题

![](/uploads/posts/rate-limiting-implementation/01-794image.png)

例如我们的接口限流每分钟处理 60 个请求，我们可以把 1 分钟分为 60 个窗口。

每隔 1 秒移动一次，当窗口移动时，需要将上一个时间片段中的请求数减掉，当新请求到达时就会检查窗口内的计数是都已满， 如果当前窗口的请求计数总和超过了限制的数量的话就不再处理其他请求。

滑动窗口算法的优缺点：

- **优点**：可以在时间内平滑地控制流量，使其可以应对突然激增的流量。很显然， 当滑动窗口的格子划分的越多，滑动窗口的滚动就越平滑，限流的统计就会越精确。
- **缺点**：依然存在限流不够平滑的问题

## 漏桶算法

我们可以把发请求的动作比作成注水到桶中，我们处理请求的过程可以比喻为漏桶漏水。我们往桶中以任意速率流入水，以一定速率流出水（可以根据对应服务按照固定的速率进行处理）。桶容量代表系统能处理的请求数，当水超过桶流量则丢弃，因为桶容量是不变的，保证了整体的速率。

![](/uploads/posts/rate-limiting-implementation/02-image.png)

如果想要实现这个算法的话也很简单，准备一个队列用来保存请求，然后我们定期从队列中拿请求来执行就好了（和消息队列削峰/限流的思想是一样的）。

漏桶算法可以控制限流速率，避免网络拥塞和系统过载。不过，漏桶算法无法应对突然激增的流量，因为只能以固定的速率处理请求，对系统资源利用不够友好。

实际业务场景中，基本不会使用漏桶算法。

## 令牌桶算法（常用）

令牌桶算法也比较简单。和漏桶算法算法一样。不过现在桶里装的是令牌了，请求在被处理之前需要拿到一个令牌，请求处理完毕之后将这个令牌丢弃（删除）。如果取不到令牌就拒绝访问。根据限流大小，通过一个线程使用定时器按照一定的速率往桶里添加令牌。如果桶装满了，就不能继续往里面继续添加令牌了。

![](/uploads/posts/rate-limiting-implementation/03-865image.png)

因为大多数流量不高的情况下，都会往桶里都会添加多余的令牌，以防突发的流量到来。令牌桶算法可以限制平均速率和应对突然激增的流量，还可以动态调整生成令牌的速率。不过，如果令牌产生速率和桶的容量设置不合理，可能会出现问题比如大量的请求被丢弃、系统过载。

### 漏桶与令牌桶的区别

它们的共同点是都有一个固定容量的桶，都是按照固定的速率往桶里添加东西，这 2 种算法的区别是漏桶是以固定速率流出，而令牌桶不是。以固定速率流出就无法应对突发流量的到来

举个例子：

漏桶以 1 秒流入 1 个请求，1 秒流出 1 个请求，那这个漏桶每秒也就只能处理一个请求，超过的请求会被拒绝掉。在 5 秒内可以处理 5 个请求，1 秒处理一个，但是假如前 4秒都没有请求，最后一秒同时来了 5 个请求，这种情况是无法处理的。

而令牌桶就会将前 4 秒没有请求的令牌存储在桶里，当最后一秒来了 5 个请求也可以对请求进行处理。

# 限流的实现方式

## 针对什么来进行限流？

实际项目中，还需要确定限流对象，也就是针对什么来进行限流。常见的限流对象如下：

- IP ：针对 IP 进行限流，适用面较广，简单粗暴。
- 业务 ID：挑选唯一的业务 ID 以实现更针对性地限流。例如，基于用户 ID 进行限流。
- 调用关系：包括基于调用方限流、基于调用链入口限流、关联流量限流等，或者实时的统计热点参数并针对热点参数的资源调用进行流量控制
- 个性化：根据用户的属性行为或系统情况，进行不同的限流策略。例如， VIP 用户不限流，而普通用户限流。根据系统的运行指标（如 QPS、并发调用数、系统负载等），动态调整限流策略。例如，当系统负载较高的时候，控制每秒通过的请求减少。

## 本地限流（单机）

> 单机限流针对的是单体架构应用

单机限流可以直接使用 Google Guava 自带的限流工具类 `RateLimiter` 。 `RateLimiter` 基于令牌桶算法，可以应对突发流量。

Google Guava 自带的限流工具实现是平滑突发限流。平滑突发限流就是按照指定的速率放令牌到桶里，而平滑预热限流会有一段预热时间，预热时间之内，速率会逐渐提升到配置的速率。

### 案例

```java
public class RateLimiterDemo {
    public static void main(String[] args) {
        // 创建一个每秒放入5个令牌的RateLimiter
        RateLimiter rateLimiter = RateLimiter.create(5);
        for (int i = 0; i < 10; i++) {
            // 从 RateLimiter 获取令牌。如果令牌不够，acquire()会阻塞，直到获取到令牌。
            double waitTime = rateLimiter.acquire(1);
            System.out.println("处理请求 " + i + "，等待时间: " + waitTime + "秒");
        }
    }
}

```

```java
处理请求 0，等待时间: 0.0秒
处理请求 1，等待时间: 0.198919秒
处理请求 2，等待时间: 0.197778秒
处理请求 3，等待时间: 0.199921秒
处理请求 4，等待时间: 0.199474秒
处理请求 5，等待时间: 0.200035秒
处理请求 6，等待时间: 0.199573秒
处理请求 7，等待时间: 0.199091秒
处理请求 8，等待时间: 0.199627秒
处理请求 9，等待时间: 0.199176秒

```

## 分布式限流

分布式限流针对的分布式/微服务应用架构应用，把整个分布式集群环境中所有服务器当做一个整体来考量。在这种架构下，单机限流就不适用了，因为会存在多种服务，并且一种服务也可能会被部署多份。

这种限流的方式是必须将限流信息保存在一个“中心化”的组件上，这样它就可以获取到集群中所有机器的访问状态。

分布式限流常见的方案：

- **借助中间件架限流**：可以借助 Sentinel 或者使用 Redis 来自己实现对应的限流逻辑。
- **网关层限流**：比较常用的一种方案，直接在网关层把限流给安排上了。不过，通常网关层限流通常也需要借助到中间件/框架。就比如 Spring Cloud Gateway 的分布式限流实现`RedisRateLimiter`就是基于 Redis+Lua 来实现的，再比如 Spring Cloud Gateway 还可以整合 Sentinel 来做限流。

如果你要基于 Redis 来手动实现限流逻辑的话，建议配合 Lua 脚本来做。

**为什么建议 Redis+Lua 的方式？** 主要有两点原因：

- **减少了网络开销**：我们可以利用 Lua 脚本来批量执行多条 Redis 命令，这些 Redis 命令会被提交到 Redis 服务器一次性执行完成，大幅减小了网络开销。
- **原子性**：一段 Lua 脚本可以视作一条命令执行，一段 Lua 脚本执行过程中不会有其他脚本或 Redis 命令同时执行，保证了操作不会被其他指令插入或打扰。
- **复用**：Lua脚本一旦执行，会永久保存 Redis 中,，其他客户端可复用

### 案例

```java
public class SimpleRedisRateLimiter {

    private static final Logger LOG = LoggerFactory.getLogger(SimpleRedisRateLimiter.class);

    private static final String RATE_LIMITER_PREFIX = "cn:bbhorse:rate:limiter:{";
    private static final String RAL_TOKENS_SUFFIX = "}:tokens:";
    private static final String RAL_TIMESTAMP_SUFFIX = "}:timestamp:";
    private static final String RAL_DEFAULT_TOKEN_ACQUIRE = "1";

    private StringRedisTemplate redis;

    private RedisScript<List<Long>> script;

    public SimpleRedisRateLimiter(StringRedisTemplate redis, RedisScript<List<Long>> script) {
        this.redis = redis;
        this.script = script;
    }

    public boolean isAllowed(int replenishRate, int burstCapacity, String sourceId) {
        try {
            String tokenKey = RATE_LIMITER_PREFIX + sourceId + RAL_TOKENS_SUFFIX;
            String timestampKey = RATE_LIMITER_PREFIX + sourceId + RAL_TIMESTAMP_SUFFIX;
            List<String> scriptKeys = Arrays.asList(tokenKey, timestampKey);
            List<Long> ret = redis.execute(
                                            script,
                                            scriptKeys, String.valueOf(replenishRate),
                                            String.valueOf(burstCapacity),
                                            String.valueOf(Instant.now().getEpochSecond()),
                                            RAL_DEFAULT_TOKEN_ACQUIRE);
            return 1 == ret.get(0);
        } catch (Exception ex) {
            LOG.error("Error determining if user allowed from redis", ex);
        }
        return true;
    }
}

```

从 META-INF/script 目录下加载 lua 脚本，并生成我们的限流实现（SimpleRedisRateLimiter 的实例）

```java
@Configuration
@ConditionalOnClass({ RedisTemplate.class })
public class RateLimitConfig {

    @Bean
    public RedisScript simpleRateLimiterScript() {
        DefaultRedisScript redisScript = new DefaultRedisScript<>();
        redisScript.setScriptSource(
                new ResourceScriptSource(
                new ClassPathResource("META-INF/script/simple_request_rate_limiter.lua")));
        redisScript.setResultType(List.class);
        return redisScript;
    }

    @Bean
    public SimpleRedisRateLimiter simpleRedisRateLimiter(
            @Qualifier("stringRedisTemplate") StringRedisTemplate redis,
            @Qualifier("simpleRateLimiterScript") RedisScript<List<Long>> script) {
        return new SimpleRedisRateLimiter(redis, script);
    }
}

```

```txt
redis.replicate_commands()

local tokens_key = KEYS[1]
local timestamp_key = KEYS[2]
--redis.log(redis.LOG_WARNING, "tokens_key " .. tokens_key)

local rate = tonumber(ARGV[1])
local capacity = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

local fill_time = capacity / rate
local ttl = math.floor(fill_time * 2)

-- for testing, it should use redis system time in production
if now == nil then
  now = redis.call('TIME')[1]
end

--redis.log(redis.LOG_WARNING, "rate " .. ARGV[1])
--redis.log(redis.LOG_WARNING, "capacity " .. ARGV[2])
--redis.log(redis.LOG_WARNING, "now " .. now)
--redis.log(redis.LOG_WARNING, "requested " .. ARGV[4])
--redis.log(redis.LOG_WARNING, "filltime " .. fill_time)
--redis.log(redis.LOG_WARNING, "ttl " .. ttl)

local last_tokens = tonumber(redis.call("get", tokens_key))
if last_tokens == nil then
  last_tokens = capacity
end
--redis.log(redis.LOG_WARNING, "last_tokens " .. last_tokens)

local last_refreshed = tonumber(redis.call("get", timestamp_key))
if last_refreshed == nil then
  last_refreshed = 0
end
--redis.log(redis.LOG_WARNING, "last_refreshed " .. last_refreshed)

local delta = math.max(0, now-last_refreshed)
local filled_tokens = math.min(capacity, last_tokens+(delta*rate))
local allowed = filled_tokens >= requested
local new_tokens = filled_tokens
local allowed_num = 0
if allowed then
  new_tokens = filled_tokens - requested
  allowed_num = 1
end

--redis.log(redis.LOG_WARNING, "delta " .. delta)
--redis.log(redis.LOG_WARNING, "filled_tokens " .. filled_tokens)
--redis.log(redis.LOG_WARNING, "allowed_num " .. allowed_num)
--redis.log(redis.LOG_WARNING, "new_tokens " .. new_tokens)

if ttl > 0 then
  redis.call("setex", tokens_key, ttl, new_tokens)
  redis.call("setex", timestamp_key, ttl, now)
end

-- return { allowed_num, new_tokens, capacity, filled_tokens, requested, new_tokens }
return { allowed_num, new_tokens }

```

```java
@Component
public class SimpleRedisRateLimiterTutorial {

    @Resource
    private SimpleRedisRateLimiter simpleRedisRateLimiter;

    ......
    public void turorial() {
        ......
        // 每1s允许访问资源5次
        if (!simpleRedisRateLimiter.isAllowed(5, 5, "tutorialResouceId")) {
            throw new RuntimeException("Too frequent visits!");
        }
        ......
    }
}

```
