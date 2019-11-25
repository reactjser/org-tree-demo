import React, { Component, createRef } from "react";
import orgTreeHelper from "org-tree-helper";
import DatGui, { DatNumber } from "react-dat-gui";
import { saveAs } from "file-saver";
import * as d3 from "d3";
import convert from "xml-js";
import SVGtoPDF from "svg-to-pdfkit";
import blobStream from "blob-stream";
import treeData from "./treeData";
import "react-dat-gui/dist/index.css";

const A4_SIZE = [841.89, 595.28];
const PADDING = [20, 20]; // 外边距

class App extends Component {
  svgRef = createRef();

  state = {
    viewBox: "0 0 0 0",
    pathData: "",
    nodesData: [],
    config: {
      spacingX: 20,
      spacingY: 40
    }
  };

  componentDidMount() {
    this.draw();
    this.handleZoom();
    this.loadFont();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.config.spacingX !== this.state.config.spacingX ||
      prevState.config.spacingY !== this.state.config.spacingY
    ) {
      this.draw();
    }
  }

  loadFont = () => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", process.env.PUBLIC_URL + "fonts/苹方黑体-准-简.ttf", true);
    xhr.responseType = "arraybuffer";
    xhr.send();
    xhr.onload = e => {
      if (e.target.status === 200) {
        this.pingfangFont = xhr.response;
      }
    };
  };

  resetZoom = () => {
    d3.select(this.svgRef.current)
      .transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity);
  };

  handleZoom() {
    this.zoom = d3
      .zoom()
      .scaleExtent([0.5, 5])
      .on("zoom", () => {
        d3.select("g.container").attr("transform", d3.event.transform);
      });

    d3.select(this.svgRef.current)
      .call(this.zoom.transform, d3.zoomIdentity)
      .call(this.zoom);
  }

  draw() {
    const {
      config: { spacingX, spacingY }
    } = this.state;
    const { pathData, nodesData, layoutExtents } = orgTreeHelper(treeData, {
      spacing: [spacingX, spacingY],
      horizontal: false // 竖直展示
    });
    this.setState({
      pathData,
      nodesData,
      viewBox: `-${PADDING[0]} -${PADDING[1]}  ${layoutExtents.width +
        PADDING[0] * 2} ${layoutExtents.height + PADDING[1] * 2}`
    });
  }

  handleConfigUpdate = newData => {
    this.setState(prevState => ({
      config: { ...prevState.config, ...newData }
    }));
  };

  handleDeparemntClick = data => {
    alert(`You clicked ${data.department}`);
  };

  getSourceObj = () => {
    const svg = this.svgRef.current;

    // 获取解析后的svg内容
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);

    // 解析为js对象
    const sourceObj = convert.xml2js(source);

    // 删除元素的缩放属性
    delete sourceObj.elements[0].elements[0].attributes.transform;

    // 将js对象转化xml格式
    return convert.js2xml(sourceObj);
  };

  handleExportSvg = () => {
    let result = this.getSourceObj();

    // 添加命名空间
    if (!result.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      result = result.replace(
        /^<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }
    if (!result.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
      result = result.replace(
        /^<svg/,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
      );
    }

    // 添加xml声明
    result = '<?xml version="1.0" standalone="no"?>\r\n' + result;

    // 将svg转为URI data
    const url =
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(result);

    // 导出SVG文件
    saveAs(url, "组织架构图.svg");
  };

  handleExportPdf = () => {
    const doc = new window.PDFDocument({
      compress: true,
      size: A4_SIZE
    });

    if (!this.pingfangFont) {
      throw new Error("Font is not prepared!");
    }

    // register font
    doc.registerFont("MyFont", this.pingfangFont);

    const result = this.getSourceObj();

    // convert svg URI data to PDF
    SVGtoPDF(doc, result, 0, 0, {
      width: A4_SIZE[0],
      height: A4_SIZE[1],
      fontCallback: (family, bold, italic, fontOptions) => {
        return "MyFont";
      }
    });

    // pipe the document to a blob
    const stream = doc.pipe(blobStream());

    doc.end();

    stream.on("finish", function() {
      // or get a blob URL for display in the browser
      const url = stream.toBlobURL("application/pdf");

      // save as PDF
      saveAs(url, "组织架构图.PDF");
    });
  };

  render() {
    const { config, viewBox, pathData, nodesData } = this.state;

    return (
      <>
        <div className="buttons-wrapper">
          <button onClick={this.resetZoom}>重置</button>
          <button onClick={this.handleExportSvg}>导出SVG</button>
          <button onClick={this.handleExportPdf}>导出PDF</button>
        </div>
        <DatGui data={config} onUpdate={this.handleConfigUpdate}>
          <DatNumber
            path="spacingX"
            label="水平内边距"
            min={0}
            max={100}
            step={1}
          />
          <DatNumber
            path="spacingY"
            label="垂直内边距"
            min={0}
            max={100}
            step={1}
          />
        </DatGui>

        <div className="App">
          <svg viewBox={viewBox} ref={this.svgRef}>
            <g className="container">
              {pathData && (
                <path d={pathData} stroke="#567ad4" strokeLinecap="round" />
              )}
              {nodesData.map(d => (
                <g
                  key={d.data.departmentId}
                  transform={`translate(${d.x},${d.y})`}
                >
                  <rect
                    x={-d.width / 2}
                    y={0}
                    width={d.width}
                    height={d.height}
                    rx={2}
                    ry={2}
                    stroke="#567ad4"
                    fill="rgb(86,122,212)"
                    fillOpacity="0.09"
                  />
                  <text
                    y={
                      d.depth <= 1
                        ? 20
                        : d.height / 2 - (18 * d.data.department.length) / 2 - 6
                    }
                    style={{
                      fontSize: 15,
                      fill: "#1990FF",
                      textAnchor: "middle",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      this.handleDeparemntClick(d.data);
                    }}
                  >
                    {d.depth <= 1
                      ? d.data.department
                      : d.data.department.split("").map(text => (
                          <tspan x="0" dy="18" key={text}>
                            {text}
                          </tspan>
                        ))}
                  </text>

                  {d.depth <= 1 && (
                    <text
                      y={40}
                      style={{
                        fontSize: 12,
                        fill: "#333",
                        textAnchor: "middle"
                      }}
                    >
                      {d.data.name}
                    </text>
                  )}
                </g>
              ))}
            </g>
          </svg>
        </div>
      </>
    );
  }
}

export default App;
