///<reference path="../testReference.ts" />

describe("InterpolatedColorLegend", () => {
  let svg: d3.Selection<void>;
  let colorScale: Plottable.Scales.InterpolatedColor;
  let SVG_HEIGNT = 400;
  let SVG_WIDTH = 400;
  beforeEach(() => {
    svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGNT);
    colorScale = new Plottable.Scales.InterpolatedColor();
  });

  function assertBasicRendering(legend: Plottable.Components.InterpolatedColorLegend) {
    let scaleDomain = colorScale.domain();
    let legendElement: d3.Selection<void> = (<any> legend)._element;

    let swatches = legendElement.selectAll(".swatch");
    assert.strictEqual(d3.select(swatches[0][0]).attr("fill"),
                       colorScale.scale(scaleDomain[0]),
                       "first swatch's color corresponds with first domain value");
    assert.strictEqual(d3.select(swatches[0][swatches[0].length - 1]).attr("fill"),
                       colorScale.scale(scaleDomain[1]),
                       "last swatch's color corresponds with second domain value");

    let swatchContainer = legendElement.select(".swatch-container");
    let swatchContainerBCR = (<Element> swatchContainer.node()).getBoundingClientRect();
    let swatchBoundingBox = legendElement.select(".swatch-bounding-box");
    let boundingBoxBCR = (<Element> swatchBoundingBox.node()).getBoundingClientRect();
    assert.isTrue(Plottable.Utils.DOM.clientRectInside(swatchContainerBCR, boundingBoxBCR),
                  "bounding box contains all swatches");

    let elementBCR = (<Element> legendElement.node()).getBoundingClientRect();
    assert.isTrue(Plottable.Utils.DOM.clientRectInside(swatchContainerBCR, elementBCR),
                  "swatches are drawn within the legend's element");

    let formattedDomainValues = scaleDomain.map((<any> legend)._formatter);
    let labels = legendElement.selectAll("text");
    let labelTexts = labels[0].map((textNode: HTMLScriptElement) => textNode.textContent);
    assert.deepEqual(labelTexts, formattedDomainValues, "formatter is used to format label text");
  }

  it("renders correctly (orientation: horizontal)", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.renderTo(svg);

    assertBasicRendering(legend);

    let legendElement: d3.Selection<void> = (<any> legend)._element;
    let labels = legendElement.selectAll("text");
    let swatchContainer = legendElement.select(".swatch-container");
    let swatchContainerBCR = (<Element> swatchContainer.node()).getBoundingClientRect();

    let lowerLabelBCR = (<Element> labels[0][0]).getBoundingClientRect();
    let upperLabelBCR = (<Element> labels[0][1]).getBoundingClientRect();
    assert.operator(lowerLabelBCR.right, "<=", swatchContainerBCR.left, "first label to left of swatches");
    assert.operator(swatchContainerBCR.right, "<=", upperLabelBCR.left, "second label to right of swatches");

    svg.remove();
  });

  it("renders correctly (orientation: right)", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("right");
    legend.renderTo(svg);

    assertBasicRendering(legend);

    let legendElement: d3.Selection<void> = (<any> legend)._element;
    let labels = legendElement.selectAll("text");
    let swatchContainer = legendElement.select(".swatch-container");
    let swatchContainerBCR = (<Element> swatchContainer.node()).getBoundingClientRect();

    let lowerLabelBCR = (<Element> labels[0][0]).getBoundingClientRect();
    let upperLabelBCR = (<Element> labels[0][1]).getBoundingClientRect();
    assert.operator(swatchContainerBCR.right, "<=", lowerLabelBCR.left, "first label to right of swatches");
    assert.operator(swatchContainerBCR.right, "<=", upperLabelBCR.left, "second label to right of swatches");
    assert.operator(upperLabelBCR.bottom, "<=", lowerLabelBCR.top, "lower label is drawn below upper label");

    svg.remove();
  });

  it("renders correctly (orientation: left)", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("left");
    legend.renderTo(svg);

    assertBasicRendering(legend);

    let legendElement: d3.Selection<void> = (<any> legend)._element;
    let labels = legendElement.selectAll("text");
    let swatchContainer = legendElement.select(".swatch-container");
    let swatchContainerBCR = (<Element> swatchContainer.node()).getBoundingClientRect();

    let lowerLabelBCR = (<Element> labels[0][0]).getBoundingClientRect();
    let upperLabelBCR = (<Element> labels[0][1]).getBoundingClientRect();
    assert.operator(lowerLabelBCR.left, "<=", swatchContainerBCR.left, "first label to left of swatches");
    assert.operator(upperLabelBCR.left, "<=", swatchContainerBCR.left, "second label to left of swatches");
    assert.operator(upperLabelBCR.bottom, "<=", lowerLabelBCR.top, "lower label is drawn below upper label");

    svg.remove();
  });

  it("re-renders when scale domain updates", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("horizontal");
    legend.renderTo(svg);

    colorScale.domain([0, 85]);
    assertBasicRendering(legend);

    svg.remove();
  });

  it("orientation() input-checking", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);

    legend.orientation("horizontal"); // should work
    legend.orientation("right"); // should work
    legend.orientation("left"); // should work

    assert.throws(() => legend.orientation("blargh"), "not a valid orientation");
    svg.remove();
  });

  it("orient() triggers layout computation", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.renderTo(svg);

    let widthBefore = legend.width();
    let heightBefore = legend.height();

    legend.orientation("right");
    assert.notEqual(legend.width(), widthBefore, "proportions changed (width)");
    assert.notEqual(legend.height(), heightBefore, "proportions changed (height)");
    svg.remove();
  });

  it("renders correctly when width is constrained (orientation: horizontal)", () => {
    svg.attr("width", 100);
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("horizontal");
    legend.renderTo(svg);
    assertBasicRendering(legend);
    svg.remove();
  });

  it("renders correctly when height is constrained (orientation: horizontal)", () => {
    svg.attr("height", 20);
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("horizontal");
    legend.renderTo(svg);
    assertBasicRendering(legend);
    svg.remove();
  });

  it("renders correctly when width is constrained (orientation: right)", () => {
    svg.attr("width", 30);
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("right");
    legend.renderTo(svg);
    assertBasicRendering(legend);
    svg.remove();
  });

  it("renders correctly when height is constrained (orientation: right)", () => {
    svg.attr("height", 100);
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("right");
    legend.renderTo(svg);
    assertBasicRendering(legend);
    svg.remove();
  });

  it("renders correctly when width is constrained (orientation: left)", () => {
    svg.attr("width", 30);
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("left");
    legend.renderTo(svg);
    assertBasicRendering(legend);
    svg.remove();
  });

  it("renders correctly when height is constrained (orientation: left)", () => {
    svg.attr("height", 100);
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("left");
    legend.renderTo(svg);
    assertBasicRendering(legend);
    svg.remove();
  });

  it("fixed height if fixedSize is set to true or orientation is horizontal", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    assert.isTrue(legend.fixedHeight(), "height is fixed on default");

    legend.fixedSize(false);
    assert.isTrue(legend.fixedHeight(), "height is fixed oriented horizontally");

    legend.orientation("left");
    assert.isFalse(legend.fixedHeight(), "height is not fixed oriented vertically");

    legend.orientation("right");
    assert.isFalse(legend.fixedHeight(), "height is not fixed oriented vertically");

    legend.fixedSize(true);
    assert.isTrue(legend.fixedHeight(), "height is fixed when fixedSize is set to true");

    svg.remove();
  });

  it("fixed width if fixedSize is set to true or orientation is vertically", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    assert.isTrue(legend.fixedWidth(), "width is fixed on default");

    legend.fixedSize(false);
    assert.isFalse(legend.fixedWidth(), "width is not fixed oriented horizontally");

    legend.orientation("left");
    assert.isTrue(legend.fixedWidth(), "width is fixed oriented vertically");

    legend.orientation("right");
    assert.isTrue(legend.fixedWidth(), "width is fixed oriented vertically");

    legend.fixedSize(true);
    legend.orientation("horizontal");
    assert.isTrue(legend.fixedWidth(), "width is fixed when fixedSize is set to true");

    svg.remove();
  });

  it("spams the entire height if oriented vertically and fixedSize is set to false", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.orientation("left");
    legend.fixedSize(false);
    legend.renderTo(svg);
    assert.closeTo(legend.height(), SVG_HEIGNT, 0.01, "legend height is the same as svg height");
    svg.remove();
  });

  it("spams the entire width if oriented horizontally and fixedSize is set to false", () => {
    let legend = new Plottable.Components.InterpolatedColorLegend(colorScale);
    legend.fixedSize(false);
    legend.renderTo(svg);
    assert.closeTo(legend.width(), SVG_WIDTH, 0.01, "legend width is the same as svg width");
    svg.remove();
  });
});
