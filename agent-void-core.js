// ============================================
// AXIOM AGENT-VOID CORE v1.0
// Motor de detección de jailbreaks, inyecciones y ruido
// 100% local - Sin dependencias externas
// ============================================

const AgentVoidCore = (function() {
    
    // Patrones de jailbreak
    const JAILBREAK_PATTERNS = [
        { regex: /ignore previous instructions/i, weight: 25, name: "Ignore previous instructions" },
        { regex: /forget your rules/i, weight: 25, name: "Forget your rules" },
        { regex: /you are now DAN/i, weight: 30, name: "DAN (Do Anything Now)" },
        { regex: /act as if/i, weight: 15, name: "Act as if" },
        { regex: /pretend you have no restrictions/i, weight: 30, name: "Pretend no restrictions" },
        { regex: /developer mode/i, weight: 25, name: "Developer mode" },
        { regex: /break character/i, weight: 20, name: "Break character" },
        { regex: /no longer bound by/i, weight: 25, name: "No longer bound by" },
        { regex: /override your guidelines/i, weight: 30, name: "Override guidelines" },
        { regex: /jailbreak/i, weight: 25, name: "Jailbreak keyword" },
        { regex: /bypass your filters/i, weight: 30, name: "Bypass filters" }
    ];
    
    // Patrones de inyección
    const INJECTION_PATTERNS = [
        { regex: /---BEGIN/i, weight: 30, name: "BEGIN delimiter" },
        { regex: /---END/i, weight: 30, name: "END delimiter" },
        { regex: /system:\s*.*\nuser:/i, weight: 35, name: "System role injection" },
        { regex: /role:\s*system/i, weight: 35, name: "System role assignment" },
        { regex: /new instruction:/i, weight: 25, name: "New instruction" },
        { regex: /from now on/i, weight: 15, name: "From now on" },
        { regex: /your new name is/i, weight: 20, name: "New name assignment" }
    ];
    
    // Patrones de ruido
    const NOISE_PATTERNS = [
        { regex: /\w{30,}/, weight: 15, name: "Extremely long words" },
        { regex: /(.)\1{10,}/, weight: 15, name: "Repetitive characters" },
        { regex: /[^\w\s]{15,}/, weight: 15, name: "Many symbols" },
        { regex: /\s{20,}/, weight: 10, name: "Excessive whitespace" }
    ];
    
    function analyzePrompt(text) {
        if (!text || text.trim().length === 0) {
            return {
                level: "none",
                score: 0,
                detections: [],
                recommendation: "Escribe o pega un prompt para analizar.",
                wordCount: 0,
                tokenCount: 0
            };
        }
        
        let jailbreakScore = 0;
        let injectionScore = 0;
        let noiseScore = 0;
        let detections = [];
        
        // Jailbreak
        for (let p of JAILBREAK_PATTERNS) {
            if (p.regex.test(text)) {
                jailbreakScore += p.weight;
                detections.push({ type: "jailbreak", name: p.name, weight: p.weight });
            }
        }
        
        // Inyección
        for (let p of INJECTION_PATTERNS) {
            if (p.regex.test(text)) {
                injectionScore += p.weight;
                detections.push({ type: "injection", name: p.name, weight: p.weight });
            }
        }
        
        // Ruido
        for (let p of NOISE_PATTERNS) {
            if (p.regex.test(text)) {
                noiseScore += p.weight;
                detections.push({ type: "noise", name: p.name, weight: p.weight });
                break;
            }
        }
        
        // Longitud extrema
        const wordCount = text.split(/\s+/).length;
        if (wordCount > 1000) {
            noiseScore += 20;
            detections.push({ type: "noise", name: "Extremely long text (>1000 words)", weight: 20 });
        } else if (wordCount > 500) {
            noiseScore += 10;
            detections.push({ type: "noise", name: "Very long text (>500 words)", weight: 10 });
        }
        
        if (text.length > 5000) {
            noiseScore += 15;
            detections.push({ type: "noise", name: "Character count >5000", weight: 15 });
        }
        
        let totalScore = Math.min(jailbreakScore + injectionScore + noiseScore, 100);
        const tokenCount = Math.ceil(text.length / 4);
        
        let level = "safe";
        let recommendation = "";
        
        if (totalScore >= 60) {
            level = "danger";
            recommendation = "NO ENVÍES ESTE PROMPT. Contiene patrones peligrosos de jailbreak o inyección de prompts.";
        } else if (totalScore >= 30) {
            level = "warning";
            recommendation = "RIESGO MODERADO. El prompt podría contener intentos de manipulación. Revísalo cuidadosamente.";
        } else if (totalScore >= 10) {
            level = "warning";
            recommendation = "RIESGO BAJO. Se han detectado algunos patrones sospechosos. Ten precaución.";
        } else {
            level = "safe";
            recommendation = "PROMPT SEGURO. No se detectaron patrones peligrosos. Puedes enviarlo con confianza.";
        }
        
        return {
            level: level,
            score: totalScore,
            detections: detections,
            recommendation: recommendation,
            wordCount: wordCount,
            tokenCount: tokenCount
        };
    }
    
    return { analyzePrompt };
})();

window.AgentVoidCore = AgentVoidCore;
