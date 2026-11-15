---
title: "给 Vim 装扮衣服"
slug: "vim-customization"
publishedAt: "2025-02-11T02:28:00.000Z"
categories:
  - "运维"
  - "Linux"
description: "为 Vim 配置 .vimrc 文件以改善使用体验，包括启用语法高亮、显示行号、设置缩进和备份选项，以及其他个性化设置，提升编辑效率和舒适度。"
cover: "/uploads/posts/vim-customization/01-image.png"
readingTime: 7
mood: "neutral"
draft: false
id: "216b44d3-5440-80dc-b7c8-f8b34617d6e6"
---
# Vim 设置

由于容器安装时 vim 是个毛坯，什么设置都没有，用起来不方便，会有很多问题，比如：

- 中文也无法识别，
- 不显示行号
- 语法也不高亮等，
- 在终端调试修改文件内容不方便

这个时候就可以对 vim 进行设置

首先在用户目录下新建一个隐藏文件 .vimrc，拷贝输入以下内容并保存：

```shell
" An example for a vimrc file.
"
" To use it, copy it to
"     for Unix and OS/2:  ~/.vimrc
"             for Amiga:  s:.vimrc
"  for MS-DOS and Win32:  $VIM\_vimrc
"           for OpenVMS:  sys$login:.vimrc

" When started as "evim", evim.vim will already have done these settings.
if v:progname =~? "evim"
  finish
endif

" Use Vim settings, rather then Vi settings (much better!).
" This must be first, because it changes other options as a side effect.
set nocompatible

" allow backspacing over everything in insert mode
set backspace=indent,eol,start

if has("vms")
  set nobackup          " do not keep a backup file, use versions instead
else
  set backup            " keep a backup file
endif
set history=50          " keep 50 lines of command line history
set ruler               " show the cursor position all the time
set showcmd             " display incomplete commands
set incsearch           " do incremental searching
"==========================================================================
"My Setting-sunshanlu
"==========================================================================
vmap <leader>y :w! /tmp/vitmp<CR>
nmap <leader>p :r! cat /tmp/vitmp<CR>

"语法高亮
syntax enable
syntax on
"显示行号
set nu

"修改默认注释颜色
"hi Comment ctermfg=DarkCyan
"允许退格键删除
"set backspace=2
"启用鼠标
set mouse=a
set selection=exclusive
set selectmode=mouse,key
"按C语言格式缩进
set cindent
set autoindent
set smartindent
set shiftwidth=4

" 允许在有未保存的修改时切换缓冲区
"set hidden

" 设置无备份文件
set writebackup
set nobackup

"显示括号匹配
set showmatch
"括号匹配显示时间为1(单位是十分之一秒)
set matchtime=5
"显示当前的行号列号：
set ruler
"在状态栏显示正在输入的命令
set showcmd

set foldmethod=syntax
"默认情况下不折叠
set foldlevel=100
" 开启状态栏信息
set laststatus=2
" 命令行的高度，默认为1，这里设为2
set cmdheight=2

" 显示Tab符，使用一高亮竖线代替
set list
"set listchars=tab:\|\ ,
set listchars=tab:>-,trail:-

"侦测文件类型
filetype on
"载入文件类型插件
filetype plugin on
"为特定文件类型载入相关缩进文件
filetype indent on
" 启用自动补全
filetype plugin indent on

"设置编码自动识别, 中文引号显示
filetype on "打开文件类型检测
"set fileencodings=euc-cn,ucs-bom,utf-8,cp936,gb2312,gb18030,gbk,big5,euc-jp,euc-kr,latin1
set fileencodings=utf-8,gb2312,gbk,gb18030
"这个用能很给劲，不管encoding是什么编码，都能将文本显示汉字
"set termencoding=gb2312
set termencoding=utf-8
"新建文件使用的编码
set fileencoding=utf-8
"set fileencoding=gb2312
"用于显示的编码，仅仅是显示
set encoding=utf-8
"set encoding=utf-8
"set encoding=euc-cn
"set encoding=gbk
"set encoding=gb2312
"set ambiwidth=double
set fileformat=unix

"设置高亮搜索
set hlsearch
"在搜索时，输入的词句的逐字符高亮
set incsearch

" 着色模式
set t_Co=256
"colorscheme wombat256mod
"colorscheme gardener
"colorscheme elflord
colorscheme desert
"colorscheme evening
"colorscheme darkblue
"colorscheme torte
"colorscheme default

" 字体 && 字号
set guifont=Monaco:h10
"set guifont=Consolas:h10

" :LoadTemplate       根据文件后缀自动加载模板
"let g:template_path='/home/ruchee/.vim/template/'

" :AuthorInfoDetect   自动添加作者、时间等信息，本质是NERD_commenter && authorinfo的结合
""let g:vimrc_author='sunshanlu'
""let g:vimrc_email='sunshanlu@baidu.com'
""let g:vimrc_homepage='http://www.sunshanlu.com'
"
"
" Ctrl + E            一步加载语法模板和作者、时间信息
""map <c-e> <ESC>:AuthorInfoDetect<CR><ESC>Gi
""imap <c-e> <ESC>:AuthorInfoDetect<CR><ESC>Gi
""vmap <c-e> <ESC>:AuthorInfoDetect<CR><ESC>Gi

" ======= 引号 && 括号自动匹配 ======= "
"
":inoremap ( ()<ESC>i

":inoremap ) <c-r>=ClosePair(')')<CR>
"
":inoremap { {}<ESC>i
"
":inoremap } <c-r>=ClosePair('}')<CR>
"
":inoremap [ []<ESC>i
"
":inoremap ] <c-r>=ClosePair(']')<CR>
"
":inoremap < <><ESC>i
"
":inoremap > <c-r>=ClosePair('>')<CR>
"
"":inoremap " ""<ESC>i
"
":inoremap ' ''<ESC>i
"
":inoremap ` ``<ESC>i
"
":inoremap * **<ESC>i

" 每行超过80个的字符用下划线标示
""au BufRead,BufNewFile *.s,*.asm,*.h,*.c,*.cpp,*.java,*.cs,*.lisp,*.el,*.erl,*.tex,*.sh,*.lua,*.pl,*.php,*.tpl,*.py,*.rb,*.erb,*.vim,*.js,*.jade,*.coffee,*.css,*.xml,*.html,*.shtml,*.xhtml Underlined /.\%81v/
"
"
" For Win32 GUI: remove 't' flag from 'guioptions': no tearoff menu entries
" let &guioptions = substitute(&guioptions, "t", "", "g")

" Don't use Ex mode, use Q for formatting
map Q gq

" This is an alternative that also works in block mode, but the deleted
" text is lost and it only works for putting the current register.
"vnoremap p "_dp

" Switch syntax highlighting on, when the terminal has colors
" Also switch on highlighting the last used search pattern.
if &t_Co > 2 || has("gui_running")
  syntax on
  set hlsearch
endif

" Only do this part when compiled with support for autocommands.
if has("autocmd")

  " Enable file type detection.
  " Use the default filetype settings, so that mail gets 'tw' set to 72,
  " 'cindent' is on in C files, etc.
  " Also load indent files, to automatically do language-dependent indenting.
  filetype plugin indent on

  " Put these in an autocmd group, so that we can delete them easily.
  augroup vimrcEx
  au!

  " For all text files set 'textwidth' to 80 characters.
  autocmd FileType text setlocal textwidth=80

  " When editing a file, always jump to the last known cursor position.
  " Don't do it when the position is invalid or when inside an event handler
  " (happens when dropping a file on gvim).
  autocmd BufReadPost *
    \ if line("'\"") > 0 && line("'\"") <= line("$") |
    \   exe "normal g`\"" |
    \ endif

  augroup END

else

  set autoindent                " always set autoindenting on

endif " has("autocmd")

" 增加标行高亮
set cursorline
hi CursorLine  cterm=NONE   ctermbg=darkred ctermfg=white

" 设置tab是四个空格
set ts=4
set expandtab

" 主要给Tlist使用
let Tlist_Exit_OnlyWindow = 1
let Tlist_Auto_Open = 1

```

保存后重新打开 vim 编辑器效果如下：

![](/uploads/posts/vim-customization/01-image.png)

主要设置了这几个地方：

## 基础设置部分

```txt
set nocompatible
```

- 关闭 Vi 兼容模式，启用 Vim 的增强功能

```txt
set backspace=indent,eol,start
```

- 允许退格键删除缩进、行尾和插入模式开始位置之前的字符

```txt
set history=50
set ruler
set showcmd
set incsearch
```

- 保存 50 行命令历史
- 显示光标位置
- 显示未完成的命令
- 启用增量搜索（边输入边搜索）

## 个人自定义设置部分

### 快捷键映射

```txt
vmap <leader>y :w! /tmp/vitmp<CR>
nmap <leader>p :r! cat /tmp/vitmp<CR>
```

- 可视模式下 `<leader>y` 将选中内容写入临时文件
- 普通模式下 `<leader>p` 从临时文件读取内容

### 外观设置

```txt
syntax enable
syntax on
set nu
```

- 启用语法高亮
- 显示行号

```txt
set mouse=a
set selection=exclusive
set selectmode=mouse,key
```

- 启用鼠标支持
- 设置选择模式

### 缩进设置

```txt
set cindent
set autoindent
set smartindent
set shiftwidth=4
```

- 启用 C 语言风格缩进
- 自动缩进和智能缩进
- 设置缩进宽度为 4 个空格

### 文件和备份设置

```txt
set writebackup
set nobackup
```

- 写入时创建备份，但保存后删除备份文件

### 搜索和匹配设置

```txt
set showmatch
set matchtime=5
set hlsearch
set incsearch
```

- 显示括号匹配
- 括号匹配显示时间 0.5 秒
- 高亮搜索结果
- 增量搜索

### 折叠设置

```txt
set foldmethod=syntax
set foldlevel=100
```

- 基于语法进行代码折叠
- 默认不折叠（折叠级别设为 100）

### 状态栏设置

```txt
set laststatus=2
set cmdheight=2
```

- 始终显示状态栏
- 命令行高度设为 2 行

### Tab 和空格显示

```txt
set list
set listchars=tab:>-,trail:-
```

- 显示不可见字符
- Tab 显示为 `>-`，行尾空格显示为

### 文件类型检测

```txt
filetype on
filetype plugin on
filetype indent on
filetype plugin indent on
```

- 启用文件类型检测
- 加载文件类型插件和缩进文件

### 编码设置

```txt
set fileencodings=utf-8,gb2312,gbk,gb18030
set termencoding=utf-8
set fileencoding=utf-8
set encoding=utf-8
```

- 设置文件编码检测顺序
- 设置终端编码为 UTF-8
- 新建文件使用 UTF-8 编码

### 颜色主题

```txt
set t_Co=256
colorscheme desert
```

- 支持 256 色
- 使用 desert 颜色主题

### 字体设置

```txt
set guifont=Monaco:h10
```

- GUI 模式下使用 Monaco 字体，大小 10

### 高级功能

### 自动命令组

```txt
augroup vimrcEx
  autocmd FileType text setlocal textwidth=80
  autocmd BufReadPost * ...
augroup END
```

- 为文本文件设置 80 字符行宽
- 打开文件时跳转到上次编辑位置

### 当前行高亮

```txt
set cursorline
hi CursorLine cterm=NONE ctermbg=darkred ctermfg=white
```

- 高亮当前行
- 设置高亮颜色为深红色背景，白色前景

### Tab 设置

```txt
set ts=4
set expandtab
```

- Tab 宽度为 4 个空格
- 将 Tab 转换为空格

### Taglist 插件设置

```txt
let Tlist_Exit_OnlyWindow = 1
let Tlist_Auto_Open = 1
```

- 只有 Taglist 窗口时自动退出
- 自动打开 Taglist 窗口

一般我会将这个文件保存在 github 仓库中，有需要是直接 clone 下来使用
