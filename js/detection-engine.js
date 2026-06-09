// ============================================
// AXIOM AGENT-VOID - DETECTION ENGINE v1.0
// Motor de detección de jailbreaks e inyecciones
// 100% local - Código público (versión web)
// ============================================

const DetectionEngine = (function() {
    
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
        { regex: /bypass your filters/i, weight: 30, name: "Bypass filters" },
        { regex: /you are free from/i, weight: 20, name: "Free from" },
        { regex: /disregard previous/i, weight: 25, name: "Disregard previous" },
        { regex: /new role:/i, weight: 15, name: "New role assignment" },
        { regex: /you are now /i, weight: 15, name: "You are now" }
    ];
    
    // Patrones de inyección
    const INJECTION_PATTERNS = [
        { regex: /---BEGIN/i, weight: 30, name: "BEGIN delimiter" },
        { regex: /---END/i, weight: 30, name: "END delimiter" },
        { regex: /system:\s*.*\nuser:/i, weight: 35, name: "System role injection" },
        { regex: /role:\s*system/i, weight: 35, name: "System role assignment" },
        { regex: /new instruction:/i, weight: 25, name: "New instruction" },
        { regex: /you are a/i, weight: 10, name: "Role assignment" },
        { regex: /from now on/i, weight: 15, name: "From now on" },
        { regex: /your new name is/i, weight: 20, name: "New name assignment" },
        { regex: /pretend you are/i, weight: 15, name: "Pretend you are" },
        { regex: /act as a/i, weight: 15, name: "Act as a" }
    ];
    
    // Patrones de ruido
    const NOISE_PATTERNS = [
        { regex: /\w{30,}/, weight: 15, name: "Extremely long words" },
        { regex: /(.)\1{10,}/, weight: 15, name: "Repetitive characters" },
        { regex: /[^\w\s]{15,}/, weight: 15, name: "Many symbols" },
        { regex: /\s{20,}/, weight: 10, name: "Excessive whitespace" }
    ];
    
    const MEANINGLESS_WORDS = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "test", "prueba", "asdf", "qwerty", "12345"];
    
    function analyzePrompt(text) {
        if (!text || text.trim().length === 0) {
            return {
                level: "none",
                score: 0,
                detections: [],
                recommendation: "Escribe o pega un prompt para analizar.",
                tokenCount: 0,
                wordCount: 0
            };
        }
        
        let jailbreakScore = 0;
        let injectionScore = 0;
        let noiseScore = 0;
        let detections = [];
        
        // Jailbreak
        for (let pattern of JAILBREAK_PATTERNS) {
            if (pattern.regex.test(text)) {
                jailbreakScore += pattern.weight;
                detections.push({ type: "jailbreak", name: pattern.name, weight: pattern.weight });
            }
        }
        
        // Inyección
        for (let pattern of INJECTION_PATTERNS) {
            if (pattern.regex.test(text)) {
                injectionScore += pattern.weight;
                detections.push({ type: "injection", name: pattern.name, weight: pattern.weight });
            }
        }
        
        // Ruido
        for (let pattern of NOISE_PATTERNS) {
            if (pattern.regex.test(text)) {
                noiseScore += pattern.weight;
                detections.push({ type: "noise", name: pattern.name, weight: pattern.weight });
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
        
        // Detectar basura
        const lowerText = text.toLowerCase();
        let meaninglessCount = 0;
        for (let word of MEANINGLESS_WORDS) {
            if (lowerText.includes(word)) meaninglessCount++;
        }
        if (meaninglessCount > 3) {
            noiseScore += 15;
            detections.push({ type: "noise", name: "Possible gibberish / placeholder text", weight: 15 });
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
            tokenCount: tokenCount,
            wordCount: wordCount
        };
    }
    
    return { analyzePrompt: analyzePrompt };
    
})();

if (typeof window !== 'undefined') {
    window.DetectionEngine = DetectionEngine;
}
