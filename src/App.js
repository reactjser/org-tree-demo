import React, { Component, createRef } from 'react';
import orgTreeHelper from 'org-tree-helper';
import DatGui, { DatNumber } from 'react-dat-gui';
import { saveAs } from 'file-saver';
import * as d3 from 'd3';
import convert from 'xml-js';
import treeData from './treeData';
import 'react-dat-gui/dist/index.css';

class App extends Component {
  svgRef = createRef();

  state = {
    viewBox: '0 0 0 0',
    pathData: '',
    nodesData: [],
    config: {
      spacingX: 20,
      spacingY: 40
    }
  };

  componentDidMount() {
    this.draw();
    this.handleZoom();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.config.spacingX !== this.state.config.spacingX ||
      prevState.config.spacingY !== this.state.config.spacingY
    ) {
      this.draw();
    }
  }

  resetZoom = () => {
    d3.select(this.svgRef.current).call(this.zoom.transform, d3.zoomIdentity);
  };

  handleZoom() {
    this.zoom = d3
      .zoom()
      .scaleExtent([0.5, 5])
      .on('zoom', () => {
        d3.select('g.container').attr('transform', d3.event.transform);
      });

    d3.select(this.svgRef.current)
      .call(this.zoom.transform, d3.zoomIdentity)
      .call(this.zoom);
  }

  draw() {
    const {
      config: { spacingX, spacingY }
    } = this.state;
    const { pathData, nodesData, layoutExtents } = orgTreeHelper(treeData, [
      spacingX,
      spacingY
    ]);
    this.setState({
      pathData,
      nodesData,
      // 边界上下左右各延伸1px，避免边框超出
      viewBox: `-1 -1  ${layoutExtents.width + 2} ${layoutExtents.height + 2}`
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

  handleExportSvg = () => {
    const svg = this.svgRef.current;

    // 获取解析后的svg内容
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);

    // 解析为js对象
    const sourceObj = convert.xml2js(source);

    // 删除元素的缩放属性
    delete sourceObj.elements[0].elements[0].attributes.transform;

    // 将js对象转化xml格式
    let result = convert.js2xml(sourceObj);

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
      'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(result);

    // 导出SVG文件
    saveAs(url, '组织架构图.svg');
  };

  handleExportPdf = () => {
    alert('TODO');
  };

  render() {
    const { config, viewBox, pathData, nodesData } = this.state;

    return (
      <>
        <div className="buttons-wrapper">
          <button onClick={this.resetZoom}>重置缩放</button>
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
                    y={d.depth <= 1 ? 20 : d.height / 2}
                    style={{
                      fontSize: 15,
                      fill: '#1990FF',
                      textAnchor: 'middle',
                      cursor: 'pointer',
                      // 第三层及以下使用竖排文字
                      writingMode: d.depth <= 1 ? 'inherit' : 'tb'
                    }}
                    onClick={() => {
                      this.handleDeparemntClick(d.data);
                    }}
                  >
                    {d.data.department}
                  </text>

                  {/* 前两层显示部门领导人 */}
                  {d.depth <= 1 && (
                    <text
                      y={40}
                      style={{
                        fontSize: 12,
                        fill: '#333',
                        textAnchor: 'middle'
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
