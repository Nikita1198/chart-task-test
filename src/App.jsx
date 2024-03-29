import './App.css';
import React from 'react'
import { initialData } from './data.js';

const radius = 128;
const radiusSkills = 330;
const textRadius = radius + 60;
const textRadiusSkills = radiusSkills + 40;
const center = { x: 450, y: 450 };
const strokeWidth = 2;
const padding = 10;

const uniqueSkillsArray = [
  ...new Set(initialData.flatMap(item => [...item.mainSkills, ...item.otherSkills]))
];

const getWordLines = (text) => {
  const maxCharInLine = 15;
  const words = text.split(' ');
  const wordLines = [];
  let currentLine = '';

  words.forEach((word) => {
    if (word.length > maxCharInLine) {
      if (currentLine) {
        wordLines.push(currentLine);
        currentLine = '';
      }
      while (word.length > 0) {
        wordLines.push(word.substring(0, maxCharInLine));
        word = word.substring(maxCharInLine);
      }
    } else {
      if ((currentLine + ' ' + word).trim().length > maxCharInLine) {
        if (currentLine) {
          wordLines.push(currentLine);
        }
        currentLine = word;
      } else {
        currentLine = (currentLine + ' ' + word).trim();
      }
    }
  });

  if (currentLine) {
    wordLines.push(currentLine);
  }

  return wordLines.filter(line => line);
};

const createPath = (start, end, controlPointFactor = 0.5) => {
  const startOffsetY = start.y + 5;
  const controlPointX = (start.x + end.x) / 2;
  const controlPointY = startOffsetY + (end.y - startOffsetY) * controlPointFactor;
  return `M ${start.x},${startOffsetY} Q ${controlPointX},${controlPointY} ${end.x},${end.y}`;
};

const App = () => {
  const [selected, setSelected] = React.useState('');
  const [rectSize, setRectSize] = React.useState({});
  const [rectSizeSkill, setRectSizeSkill] = React.useState({});
  
  const [selectedSkill, setSelectedSkill] = React.useState('');
  const [selectedSkills, setSelectedSkills] = React.useState(new Set());
  const [selectedProfessionCenter, setSelectedProfessionCenter] = React.useState(null);
  const [highlightedSkills, setHighlightedSkills] = React.useState([]);
  const textRefs = React.useRef({});

  const [points, setPoints] = React.useState([]) 
  const [pointsSkills, setPointsSkills] = React.useState([]) 
  
  React.useEffect(() => {
    const initialPoints = initialData.map((competency, index) => {
      const k = -5; // Смещение эллипса
      const angle = (index / initialData.length) * (2 * Math.PI) - Math.PI / 2;
      const pointX = center.x + radius * Math.cos(angle);
      const pointY = center.y + radius * Math.sin(angle);
      const textX = center.x + textRadius * Math.cos(angle);
      const textY = center.y + textRadius * Math.sin(angle) + k;
      const wordLines = getWordLines(competency.name);
    
      let textAnchor = pointX > center.x ? 'start' : 'end';
      if (pointX == center.x) {
        textAnchor = 'middle'
      }
    
      return {
        index: index,
        pointX,
        pointY,
        textX,
        textY,
        name: competency.name,
        wordLines,
        textAnchor: textAnchor
      };
    });

    const initialPointsSkills = uniqueSkillsArray.map((competency, index) => {
      const angle = (index / uniqueSkillsArray.length) * (2 * Math.PI) - Math.PI / 2;
      const pointX = center.x + radiusSkills * Math.cos(angle);
      const pointY = center.y + radiusSkills * Math.sin(angle);
      const textX = center.x + textRadiusSkills * Math.cos(angle);
      const textY = center.y + textRadiusSkills * Math.sin(angle);
      const wordLines = getWordLines(competency);
    
      let textAnchor = pointX > center.x ? 'start' : 'end';
      if (pointX == center.x) {
        textAnchor = 'middle'
      }
    
      return {
        index: index,
        pointX,
        pointY,
        textX,
        textY,
        name: competency,
        wordLines,
        textAnchor: textAnchor
      };
    })
    
    setPointsSkills(initialPointsSkills)
    setPoints(initialPoints)
  }, [])

  React.useEffect(() => {
    let currentSelection = selected || selectedSkill;
    if (currentSelection && textRefs.current[currentSelection]) {
      const bbox = textRefs.current[currentSelection].getBBox();
      setRectSize({
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height
      });
    }

    if (selectedSkill && textRefs.current[selectedSkill]) {
      const bbox = textRefs.current[selectedSkill].getBBox();
      setRectSizeSkill({
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height
      });
    }
  }, [selected, selectedSkill]);

  const handlePointClick = (name) => {
    const selectedProfessionIndex = initialData.findIndex(p => p.name === name);
    const selectedProfession = initialData[selectedProfessionIndex];
    const selectedProfessionSkills = [
        ...selectedProfession.mainSkills,
        ...selectedProfession.otherSkills,
    ];

    const selectedProfessionAngle = (selectedProfessionIndex / initialData.length) * (2 * Math.PI);

    const calculateAngleDistance = (skillIndex) => {
      const skillAngle = (skillIndex / uniqueSkillsArray.length) * (2 * Math.PI);
      let angleDistance = Math.abs(skillAngle - selectedProfessionAngle);
      angleDistance = angleDistance > Math.PI ? (2 * Math.PI) - angleDistance : angleDistance;
      return angleDistance;
    };

    const skillDistances = uniqueSkillsArray.map((_, index) => ({
      index,
      distance: calculateAngleDistance(index)
    }));

    skillDistances.sort((a, b) => a.distance - b.distance);

    const numberOfSkills = selectedProfession.mainSkills.length + selectedProfession.otherSkills.length;
    const closestSkillsIndexes = skillDistances.slice(0, numberOfSkills).map(sd => sd.index);

    setSelectedSkills(new Set(closestSkillsIndexes.map(index => uniqueSkillsArray[index])));

    const professionSkillsSelected = pointsSkills.filter(skill => 
      selectedProfessionSkills.includes(skill.name)
    );
    const professionSkillsClosest = pointsSkills.filter(skill => 
      closestSkillsIndexes.includes(skill.index)
    );

    const updatesMap = new Map();

    // Заполняем карту данными из professionSkillsSelected
    professionSkillsSelected.forEach((selectedSkill) => {
      updatesMap.set(selectedSkill.index, {
        name: selectedSkill.name,
        wordLines: selectedSkill.wordLines,
        textAnchor: selectedSkill.textAnchor
      });
    });

    // 2. Обновление pointsSkills с новыми данными из professionSkillsClosest
    const updatedPointsSkills = pointsSkills.map((skill) => {
      if (closestSkillsIndexes.includes(skill.index)) {
        // Для ближайших навыков обновляем данные из карты
        const update = updatesMap.get(skill.index);
        if (update) {
          return {
            ...skill,
            name: update.name,
            wordLines: update.wordLines,
            textAnchor: update.textAnchor
          };
        }
      } else if (selectedProfessionSkills.includes(skill.name)) {
        // Для выбранных навыков находим соответствующий ближайший навык и обмениваемся данными
        const closestSkill = professionSkillsClosest.find(closestSkill => closestSkill.index === skill.index);
        if (closestSkill) {
          return {
            ...skill,
            name: closestSkill.name,
            wordLines: closestSkill.wordLines,
            textAnchor: closestSkill.textAnchor
          };
        }
      }
      // Для остальных навыков возвращаем без изменений
      return skill;
    });

    setPointsSkills(updatedPointsSkills);

    setSelected(name);
    setSelectedSkill('');

    const professionIndex = initialData.findIndex(p => p.name === name);
    setSelectedProfessionCenter(points[professionIndex]);

    const skillsToHighlight = closestSkillsIndexes.map(index => uniqueSkillsArray[index]);
    setHighlightedSkills(skillsToHighlight);
  };

  const handleSkillClick = (skillName) => {
    setSelectedSkill(skillName);
    setSelected('');
    setHighlightedSkills([])
    setSelectedSkills(new Set([skillName]))
  };

  const paths = highlightedSkills.map((skillName, i) => {
    const skillPoint = pointsSkills.find(p => p.name === skillName);
    if (!selectedProfessionCenter || !skillPoint) {
      return null;
    }
    const pathData = createPath(
      { x: selectedProfessionCenter.pointX, y: selectedProfessionCenter.pointY },
      { x: skillPoint.pointX, y: skillPoint.pointY }
    );
    const uniqueKey = `path-${selectedProfessionCenter.name}-${skillName}-${i}`;
    return <path d={pathData} key={uniqueKey} stroke="orange" strokeWidth={strokeWidth} fill="none" />;
  });

  return (
    <div className="App">
      <svg width="100vw" height="100vh" viewBox="0 0 900 900">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="black" floodOpacity="0.5" />
          </filter>
        </defs>

        <circle cx={center.x} cy={center.y} r={radius} stroke="#ADADAD" strokeWidth="2.35px" fill="transparent" />
        <circle cx={center.x} cy={center.y} r={radiusSkills} stroke="#ADADAD" strokeWidth="2.35px" fill="transparent" />

        {paths}

        {points.map((point) => (
          <React.Fragment key={point.name}>
            <circle
              cx={point.pointX}
              cy={point.pointY}
              r="13.75"
              fill={selected === point.name ? '#00A372' : '#ADADAD'}
              stroke={selected === point.name ? '#00A372' : '#ADADAD'}
              onClick={() => handlePointClick(point.name)}
              style={{ cursor: 'pointer', transition: 'all 0.5s ease' }}
            />
            {selected === point.name && (
              <circle
                cx={point.pointX}
                cy={point.pointY}
                r="18"
                fill="white"
                stroke="none"
                style={{ transition: 'all 0.9s ease' }}
              />
            )}
            <circle
              cx={point.pointX}
              cy={point.pointY}
              r="13.75"
              fill={selected === point.name ? '#00A372' : '#ADADAD'}
              stroke={selected === point.name ? '#00A372' : '#ADADAD'}
              onClick={() => handlePointClick(point.name)}
              style={{ cursor: 'pointer', transition: 'all 0.9s ease' }}
            />
            {selected === point.name && rectSize.width && (
              <>
                <circle
                  cx={point.pointX}
                  cy={point.pointY}
                  r="18"
                  fill="none"
                  className="circle-highlight visible"
                />
                <rect
                  className={`rect ${selected === point.name ? 'selected' : ''}`}
                  x={rectSize.x - padding}
                  y={rectSize.y - padding}
                  width={rectSize.width + padding * 2}
                  height={rectSize.height + padding * 2}
                  rx="10"
                  ry="10"
                  fill="rgba(255, 255, 255, 0.5)"
                  stroke="#f4f4f4"
                  strokeWidth="1"
                  style={{ backdropFilter: 'blur(1px)' }}
                />
              </>
            )}
            <text
              ref={(el) => {
                textRefs.current[point.name] = el;
              }}
              x={point.textX}
              y={point.textY}
              className="text"
              textAnchor={point.textAnchor}
              dominantBaseline="middle"
              style={{ pointerEvents: 'none' }}
            >
              {point.wordLines.map((line, i) => (
                <tspan x={point.textX} dy={`${i === 0 ? 0 : 1.2}em`} key={i}>
                  {line}
                </tspan>
              ))}
            </text>
          </React.Fragment>
        ))}

        {pointsSkills.map((point) => (
          <React.Fragment key={point.name}>

            {selectedSkill === point.name && rectSizeSkill.width && (
              <circle
                cx={point.pointX}
                cy={point.pointY}
                r="18"
                fill="none"
                className="circle-highlight visibleSkills"
              />
            )}

            {selectedSkill === point.name && (
              <circle
                cx={point.pointX}
                cy={point.pointY}
                r="18"
                fill="white"
                stroke="none"
                style={{ transition: 'all 0.9s ease' }}
              />
            )}
            <circle
              cx={point.pointX}
              cy={point.pointY}
              r="13.75"
              fill={selectedSkills.has(point.name) ? '#FF7A00' : '#ffd4ac'}
              stroke={selectedSkills.has(point.name) ? '#FF7A00' : '#ffd4ac'}
              onClick={() => handleSkillClick(point.name)}
              style={{ cursor: 'pointer', zIndex: 10 }}
            />


            <text
              ref={(el) => {
                textRefs.current[point.name] = el;
              }}
              x={point.textX}
              y={point.textY}
              className="text"
              textAnchor={point.textAnchor}
              dominantBaseline="middle"
              style={{
                pointerEvents: 'none',
                fill: selectedSkills.has(point.name) ? '#000' : '#ADADAD'
              }}
            >
              {point.wordLines.map((line, i) => (
                <tspan x={point.textX} dy={`${i === 0 ? 0 : 1.2}em`} key={i}>
                  {line}
                </tspan>
              ))}
            </text>
          </React.Fragment>
        ))}

      </svg>
    </div>
  );
};

export default App;