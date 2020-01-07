const WIDTH = 800;
const HEIGHT = 550;
const SCALE = 4;

var svg = d3.select("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`)

const in_px = (inches) => inches * SCALE;

const CENTER_OF_MASS_OFFSET_FT = 2 + 2/12.0;
const CENTER_OF_MASS_OFFSET = in_px(CENTER_OF_MASS_OFFSET_FT*12);
const MASS = 93; // pounds
const BAR_LENGTH = in_px(9*12 + 6.25);
const PIVOT_TO_RUNG_FT = 4;
const PIVOT_TO_RUNG = in_px(PIVOT_TO_RUNG_FT*12);

const MAX_ANG = 14.5;

const PIVOT = {x: WIDTH/2, y: 50}
const RUNG  = [
    [PIVOT.x - BAR_LENGTH/2, PIVOT.y + PIVOT_TO_RUNG],
    [PIVOT.x, PIVOT.y],
    [PIVOT.x + BAR_LENGTH/2, PIVOT.y + PIVOT_TO_RUNG]
]

const FLOOR_Y = PIVOT.y + in_px(9*12 + 3.375)

var lineGenerator = d3.line();

var pivot = svg.append("circle")
    .attr("cx", PIVOT.x)
    .attr("cy", PIVOT.y)
    .style("fill", "none")
    .attr("stroke", "black")
    .attr("r", 10);

var group = svg.append("g")
    .attr("id", "things");

var rung = group.append("path")
    .attr("stroke", "black")
    .attr("d", lineGenerator(RUNG.concat([RUNG[0]])));

var center_of_mass = group.append("circle")
    .attr("cx", PIVOT.x)
    .attr("cy", PIVOT.y + CENTER_OF_MASS_OFFSET)
    .attr("stroke", "black")
    .attr("r", 5);

var robot1 = group.append("circle")
    .text("1")
    .attr("id", "robot1");

var robot2 = group.append("circle")
    .text("2")
    .attr("id", "robot2");

var robot3 = group.append("circle")
    .text("3")
    .attr("id", "robot3");

var hangRobot1 = group.append("line")
    .attr("y1", PIVOT.y + PIVOT_TO_RUNG)
    .attr("stroke", "black")
    .attr("id", "hangRobot1");

var hangRobot2 = group.append("line")
    .attr("y1", PIVOT.y + PIVOT_TO_RUNG)
    .attr("stroke", "black")
    .attr("id", "hangRobot2");

var hangRobot3 = group.append("line")
    .attr("y1", PIVOT.y + PIVOT_TO_RUNG)
    .attr("stroke", "black")
    .attr("id", "hangRobot3");

var floor = svg.append("line")
    .attr("x1", 0)
    .attr("y1", FLOOR_Y)
    .attr("x2", WIDTH)
    .attr("y2", FLOOR_Y)
    .attr("stroke", "black");

var text = svg.append("text")
    .attr("x", 30)
    .attr("y", 50)
    .style("font-family", "Segoe UI")
    .style("fill", "black")
    .style("font-size", "30px")
    .text("0°");

//GetAngle now uses pixels 
function getAngle(m_1, d_1, h_1, m_2, d_2, h_2, m_3, d_3, h_3) {
    let numerator = (m_1*d_1) + (m_2*d_2) + (m_3*d_3);
    let denominator = (m_1*(PIVOT_TO_RUNG+h_1)) + (m_2*(PIVOT_TO_RUNG+h_2)) + (m_3*(PIVOT_TO_RUNG+h_3)) + (MASS*CENTER_OF_MASS_OFFSET);
    let theta = Math.atan(numerator / denominator)
    return theta;
}

var rad_to_deg = (rad) => rad * (180 / Math.PI); 

function setAngle(angle) {
    let theta = angle
    theta = d3.min([theta, MAX_ANG])
    theta = d3.max([theta, -MAX_ANG])

    group.transition()
        .duration(750)
            .attr("transform", `rotate(${theta} ${PIVOT.x} ${PIVOT.y})`);
}

function update() {
    // Convert distances to pixels because getAngle natively uses pixel constants
    let m_1 = d3.select("input[name=robot_1]").node().value;
    let d_1 = in_px(d3.select("input[name=robot_1_d]").node().value);
    let h_1 = in_px(d3.select("input[name=robot_1_h]").node().value);

    let m_2 = d3.select("input[name=robot_2]").node().value;
    let d_2 = in_px(d3.select("input[name=robot_2_d]").node().value);
    let h_2 = in_px(d3.select("input[name=robot_2_h]").node().value);

    let m_3 = d3.select("input[name=robot_3]").node().value;
    let d_3 = in_px(d3.select("input[name=robot_3_d]").node().value);
    let h_3 = in_px(d3.select("input[name=robot_3_h]").node().value);

    let angle = rad_to_deg(getAngle(m_1, d_1, h_1, m_2, d_2, h_2, m_3, d_3, h_3));
    setAngle(angle);

    robot1.transition()
        .attr("cy", PIVOT.y + PIVOT_TO_RUNG + h_1)
        .attr("cx", PIVOT.x + d_1)
        .attr("r", m_1 * .1);
    robot2.transition()
        .attr("cy", PIVOT.y + PIVOT_TO_RUNG + h_2)
        .attr("cx", PIVOT.x + d_2)
        .attr("r", m_2 * .1);
    robot3.transition()
        .attr("cy", PIVOT.y + PIVOT_TO_RUNG + h_3)
        .attr("cx", PIVOT.x + d_3)
        .attr("r", m_3 * .1);

    hangRobot1.transition()
        .attr("x1", PIVOT.x + d_1)
        .attr("x2", PIVOT.x + d_1)
        .attr("y2", PIVOT.y + PIVOT_TO_RUNG + h_1);

    hangRobot2.transition()
        .attr("x1", PIVOT.x + d_2)
        .attr("x2", PIVOT.x + d_2)
        .attr("y2", PIVOT.y + PIVOT_TO_RUNG + h_2);

    hangRobot3.transition()
        .attr("x1", PIVOT.x + d_3)
        .attr("x2", PIVOT.x + d_3)
        .attr("y2", PIVOT.y + PIVOT_TO_RUNG + h_3);

    
    text.text(`${Math.abs(angle).toFixed(2)}°`)
        .transition()
            .duration(1000)
            .style("fill", Math.abs(angle) > 8  ? "red" : "black");
}

update();
d3.selectAll("input").on("change", update);
