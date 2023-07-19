---
title: 破事水：用GPT4重构一段Java代码
mathjax: false
date: 2023-07-18 11:45:14
categories: [技术]
tags: [GPT, Java, 设计模式]
---
## ask: 如何使用模板方法重构下面的代码：
```java
    public void exportOrder(OrderQueryDTO queryDTO, HttpServletResponse response) {
        ExcelWriter excelWriter = EasyExcel.write(EasyExcelUtil.getOutputStream("订单导出", response)).build();

        WriteSheet writeSheet = EasyExcel.writerSheet(1, "订单明细")
                .head(OrderExportVO.class).build();
        WriteSheet writeSheet2 = EasyExcel.writerSheet(2, "订单商品明细")
                .head(OrderGoodsExportVO.class).build();

        PageDto pageDto = new PageDto(1, 1000, false);
        while (true) {
            IPage<Order> page = this.page(setPage(pageDto), getLQW(queryDTO));
            List<Order> records = page.getRecords();
            List<OrderExportVO> exports = setUpOrderExportVO(records);

            List<OrderGoodsExportVO> orderGoodsExports = setUpOrderGoodsExportExportVO(records);

            excelWriter.write(exports, writeSheet);
            excelWriter.write(orderGoodsExports, writeSheet2);

            if (page.getCurrent() >= page.getPages()) {
                break;
            }
            pageDto.setPage(pageDto.getPage() + 1);
        }
        excelWriter.finish();
    }
```
### answer:
这里的模板方法模式可以用来将导出过程的骨架定义在一个抽象类中，然后通过子类来实现特定的步骤。这样可以让代码更加清晰和可扩展。

首先，我们创建一个`ExportStep`抽象类，定义导出过程的骨架：

```java
public abstract class ExportStep {
    protected ExcelWriter excelWriter;
    protected WriteSheet writeSheet;

    public ExportStep(ExcelWriter excelWriter, String sheetName, Class<?> clazz) {
        this.excelWriter = excelWriter;
        this.writeSheet = EasyExcel.writerSheet(sheetName).head(clazz).build();
    }

    public abstract List<?> setupExportData(List<Order> records);

    public void writeData(List<Order> records) {
        List<?> data = setupExportData(records);
        excelWriter.write(data, writeSheet);
    }
}
```

然后，我们创建具体的导出类，实现特定的步骤：

```java
public class OrderExportStep extends ExportStep {
    public OrderExportStep(ExcelWriter excelWriter) {
        super(excelWriter, "订单明细", OrderExportVO.class);
    }

    @Override
    public List<OrderExportVO> setupExportData(List<Order> records) {
        return setUpOrderExportVO(records);
    }
}

public class OrderGoodsExportStep extends ExportStep {
    public OrderGoodsExportStep(ExcelWriter excelWriter) {
        super(excelWriter, "订单商品明细", OrderGoodsExportVO.class);
    }

    @Override
    public List<OrderGoodsExportVO> setupExportData(List<Order> records) {
        return setUpOrderGoodsExportExportVO(records);
    }
}
```

最后，在主方法中使用具体的导出类来进行导出：

```java
public void exportOrder(OrderQueryDTO queryDTO, HttpServletResponse response) {
    ExcelWriter excelWriter = EasyExcel.write(EasyExcelUtil.getOutputStream("订单导出", response)).build();

    ExportStep[] steps = new ExportStep[] {
        new OrderExportStep(excelWriter),
        new OrderGoodsExportStep(excelWriter)
    };

    PageDto pageDto = new PageDto(1, 1000, false);
    while (true) {
        IPage<Order> page = this.page(setPage(pageDto), getLQW(queryDTO));
        List<Order> records = page.getRecords();

        for (ExportStep step : steps) {
            step.writeData(records);
        }

        if (page.getCurrent() >= page.getPages()) {
            break;
        }
        pageDto.setPage(pageDto.getPage() + 1);
    }
    excelWriter.finish();
}
```

这样，我们就使用模板方法模式重构了这段代码，使得代码更加清晰和可扩展。

## ask: 可以把上述代码中的while循环改成迭代器模式吗

### answer:
是的，我们可以使用迭代器模式来改造这个while循环。迭代器模式提供了一种方法访问一个容器对象中各个元素，而又不暴露该对象的内部细节。

首先，我们需要创建一个迭代器：

```java
public class OrderIterator implements Iterator<List<Order>> {
    private final OrderService orderService;
    private final OrderQueryDTO queryDTO;
    private final PageDto pageDto;
    private IPage<Order> currentPage;

    public OrderIterator(OrderService orderService, OrderQueryDTO queryDTO, PageDto pageDto) {
        this.orderService = orderService;
        this.queryDTO = queryDTO;
        this.pageDto = pageDto;
        this.currentPage = orderService.page(setPage(pageDto), getLQW(queryDTO));
    }

    @Override
    public boolean hasNext() {
        return currentPage.getCurrent() < currentPage.getPages();
    }

    @Override
    public List<Order> next() {
        List<Order> records = currentPage.getRecords();
        pageDto.setPage(pageDto.getPage() + 1);
        this.currentPage = orderService.page(setPage(pageDto), getLQW(queryDTO));
        return records;
    }
}
```

然后，我们在`exportOrder`方法中使用`OrderIterator`：

```java
public void exportOrder(OrderQueryDTO queryDTO, HttpServletResponse response) {
    ExcelWriter excelWriter = EasyExcel.write(EasyExcelUtil.getOutputStream("订单导出", response)).build();

    ExportStep[] steps = new ExportStep[] {
        new OrderExportStep(excelWriter),
        new OrderGoodsExportStep(excelWriter)
    };

    OrderIterator orderIterator = new OrderIterator(this, queryDTO, new PageDto(1, 1000, false));
    while (orderIterator.hasNext()) {
        List<Order> records = orderIterator.next();

        for (ExportStep step : steps) {
            step.writeData(records);
        }
    }
    excelWriter.finish();
}
```

这样，我们就使用迭代器模式重构了这段代码，使得代码更加清晰和可扩展。

## ask: 可以将上述代码的ExportStep改用责任链模式重构吗

### answer:
当然可以。责任链模式（Chain of Responsibility Pattern）是一种设计模式，其中对象的接收者形成一个链，并沿着这个链传递请求，直到一个对象处理它为止。这使得多个对象都有机会处理请求。

首先，我们需要修改`ExportStep`类，让它能够引用下一个`ExportStep`：

```java
public abstract class ExportStep {
    protected ExcelWriter excelWriter;
    protected WriteSheet writeSheet;
    protected ExportStep nextStep;

    public ExportStep(ExcelWriter excelWriter, String sheetName, Class<?> clazz) {
        this.excelWriter = excelWriter;
        this.writeSheet = EasyExcel.writerSheet(sheetName).head(clazz).build();
    }

    public abstract List<?> setupExportData(List<Order> records);

    public void writeData(List<Order> records) {
        List<?> data = setupExportData(records);
        excelWriter.write(data, writeSheet);
        if (nextStep != null) {
            nextStep.writeData(records);
        }
    }

    public void setNextStep(ExportStep nextStep) {
        this.nextStep = nextStep;
    }
}
```

然后，我们在主方法中使用责任链模式：

```java
public void exportOrder(OrderQueryDTO queryDTO, HttpServletResponse response) {
    ExcelWriter excelWriter = EasyExcel.write(EasyExcelUtil.getOutputStream("订单导出", response)).build();

    ExportStep orderExportStep = new OrderExportStep(excelWriter);
    ExportStep orderGoodsExportStep = new OrderGoodsExportStep(excelWriter);
    orderExportStep.setNextStep(orderGoodsExportStep);

    OrderIterator orderIterator = new OrderIterator(this, queryDTO, new PageDto(1, 1000, false));
    while (orderIterator.hasNext()) {
        List<Order> records = orderIterator.next();
        orderExportStep.writeData(records);
    }
    excelWriter.finish();
}
```

这样，我们就使用责任链模式重构了这段代码，使得代码更加清晰和可扩展。