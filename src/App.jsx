import './App.css';
import React from 'react'

const initialData = [
  {
    name: "Финансовый аналитик",
    mainSkills: ["Excel", "SQL", "VBA", "1С"],
    otherSkills: ["Power BI", "Python"],
  },
  {
    name: "Предприниматель",
    mainSkills: ["1C", "Excel", "Power BI"],
    otherSkills: [
      "Google Analytics",
      "Яндекс.Метрика",
      "Python",
      "SQL",
      "Tilda",
    ],
  },
  {
    name: "Продуктовый дизайнер",
    mainSkills: [
      "Figma",
      "Sketch",
      "Illustrator",
      "Photoshop",
      "Principle",
      "Tilda",
    ],
    otherSkills: ["Shopify", "Protopie", "Cinema 4D"],
  },
  {
    name: "Менеджер проекта",
    mainSkills: [
      "Visio",
      "1C",
      "Google Analytics",
      "Яндекс.Метрика",
      "Python",
      "SQL",
      "Tilda",
    ],
    otherSkills: ["Figma", "Sketch", "Shopify"],
  },
  {
    name: "Финансовый менеджер",
    mainSkills: ["1C", "Excel", "Power BI"],
    otherSkills: ["BPMN"],
  },
  {
    name: "Руководитель финансового департамента компании",
    mainSkills: ["Sketch", "Figma"],
    otherSkills: ["Shopify", "HQL"],
  },

  {
    name: "Продуктовый аналитик",
    mainSkills: [
      "Google Analytics",
      "Яндекс.Метрика",
      "SQL",
      "Power BI",
      "Python",
      "Excel",
    ],
    otherSkills: ["HQL", "Tableau", "R", "Machine learning"],
  },

  {
    name: "Руководитель финансового продукта",
    mainSkills: ["Visio"],
    otherSkills: ["Python"],
  },
  {
    name: "Менеджер по маркетингу",
    mainSkills: [
      "Google Analytics",
      "Яндекс.Метрика",
      "Google Ads",
      "Ahrefs",
      "Главред",
      "My Target",
    ],
    otherSkills: ["Tilda", "Photoshop", "Xenu", "Python"],
  },

  {
    name: "Менеджер по цифровой трансформации",
    mainSkills: [
      "Visio",
      "Google Analytics",
      "Яндекс.Метрика",
      "Python",
      "SQL",
      "Tilda",
    ],
    otherSkills: ["Figma", "Sketch", "Shopify"],
  },
];

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

  const radius = 130;
  const radiusSkills = 350;
  const textRadius = radius + 90; 
  const textRadiusSkills = radiusSkills + 80; 
  const center = { x: 450, y: 450 };
  const strokeWidth = 2;
  const padding = 10;

  const handlePointClick = (name) => {
    // Определение выбранной профессии
    const selectedProfessionIndex = initialData.findIndex(p => p.name === name);
    const selectedProfession = initialData[selectedProfessionIndex];
  
    // Вычисление угла для выбранной профессии
    const selectedProfessionAngle = (selectedProfessionIndex / initialData.length) * (2 * Math.PI);
  
    // Функция для вычисления углового расстояния до выбранной профессии
    const calculateAngleDistance = (skillIndex) => {
      const skillAngle = (skillIndex / uniqueSkillsArray.length) * (2 * Math.PI);
      let angleDistance = Math.abs(skillAngle - selectedProfessionAngle);
      // Угловое расстояние не может быть больше π
      angleDistance = angleDistance > Math.PI ? (2 * Math.PI) - angleDistance : angleDistance;
      return angleDistance;
    };
  
    // Выбор ближайших навыков по угловому расстоянию
    // Сначала создаем пары [index, angleDistance] для каждого навыка
    const skillDistances = uniqueSkillsArray.map((_, index) => ({
      index,
      distance: calculateAngleDistance(index)
    }));
  
    // Затем сортируем их по угловому расстоянию
    skillDistances.sort((a, b) => a.distance - b.distance);
  
    // И наконец выбираем индексы ближайших навыков
    const numberOfSkills = selectedProfession.mainSkills.length + selectedProfession.otherSkills.length;
    const closestSkillsIndexes = skillDistances.slice(0, numberOfSkills).map(sd => sd.index);
  
    // Подсветка выбранных навыков
    setSelectedSkills(new Set(closestSkillsIndexes.map(index => uniqueSkillsArray[index])));
  
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

  const pointsSkills = uniqueSkillsArray.map((competency, index) => {
    const angle = (index / uniqueSkillsArray.length) * (2 * Math.PI) - Math.PI / 2;
    const pointX = center.x + radiusSkills * Math.cos(angle);
    const pointY = center.y + radiusSkills * Math.sin(angle);
    const textX = center.x + textRadiusSkills * Math.cos(angle);
    const textY = center.y + textRadiusSkills * Math.sin(angle);
    const wordLines = getWordLines(competency);

    return {
      pointX,
      pointY,
      textX,
      textY,
      name: competency,
      wordLines,
      textAnchor: 'middle'
    };
  });

  const points = initialData.map((competency, index) => {
    const angle = (index / initialData.length) * (2 * Math.PI) - Math.PI / 2;
    const pointX = center.x + radius * Math.cos(angle);
    const pointY = center.y + radius * Math.sin(angle);
    const textX = center.x + textRadius * Math.cos(angle);
    const textY = center.y + textRadius * Math.sin(angle);
    const wordLines = getWordLines(competency.name);

    return {
      pointX,
      pointY,
      textX,
      textY,
      name: competency.name,
      wordLines,
      textAnchor: 'middle'
    };
  });

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
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="black" floodOpacity="0.5"/>
          </filter>
        </defs>

        <circle cx={center.x} cy={center.y} r={radius} stroke="grey" strokeWidth="4" fill="transparent" />
        <circle cx={center.x} cy={center.y} r={radiusSkills} stroke="grey" strokeWidth="4" fill="transparent" />

        {paths}
        {points.map((point) => (
          <React.Fragment key={point.name}>
            <circle
              cx={point.pointX}
              cy={point.pointY}
              r="13"
              fill={selected === point.name ? '#71bc78' : 'grey'}
              stroke={selected === point.name ? 'black' : 'grey'}
              onClick={() => handlePointClick(point.name)}
              style={{ cursor: 'pointer', transition: 'all 0.5s ease' }}
            />
            {selected === point.name && (
            <circle
                cx={point.pointX}
                cy={point.pointY}
                r="20"
                fill="white"
                stroke="none"
                style={{transition: 'all 0.9s ease'}}
              />
            )}
            <circle
              cx={point.pointX}
              cy={point.pointY}
              r="13"
              fill={selected === point.name ? '#71bc78' : 'grey'}
              stroke={selected === point.name ? 'black' : 'grey'}
              onClick={() => handlePointClick(point.name)}
              style={{ cursor: 'pointer', transition: 'all 0.9s ease' }}
            />
            {selected === point.name && rectSize.width && (
              <>
                <circle
                  cx={point.pointX}
                  cy={point.pointY}
                  r="20"
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
                  fill="#e9ebea"
                  stroke="#c4c8c6"
                  strokeWidth="1"
                  style={{ filter: 'url(#shadow)' }}
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
                r="22"
                fill="none"
                className="circle-highlight visibleSkills"
              />
            )}
            
            {selectedSkill === point.name && (
            <circle
                cx={point.pointX}
                cy={point.pointY}
                r="22"
                fill="white"
                stroke="none"
                style={{transition: 'all 0.9s ease'}}
              />
            )}
            <circle
              cx={point.pointX}
              cy={point.pointY}
              r="15"
              fill={selectedSkills.has(point.name) ? '#ffac60' : '#ffd4ac'} 
              stroke={selectedSkills.has(point.name) ? 'black' : '#ffd4ac'}
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
                fill: selectedSkills.has(point.name) ? '#000' : 'lightgrey' 
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