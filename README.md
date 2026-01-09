# Análisis de Infraestructura Maliciosa: `jnmbmw.hottview.net`

**Fecha:** 9 de Enero, 2026
**Clasificación:** TLP:WHITE
**Investigador:** Security Researcher

---

## 1. Resumen Ejecutivo
Se ha identificado y analizado una infraestructura activa de **Distribución de Tráfico (TDS)** alojada en el dominio `jnmbmw.hottview.net`. Este nodo actúa como intermediario en campañas de publicidad maliciosa (Malvertising) y Phishing, redirigiendo a las víctimas basándose en huellas digitales del navegador y geolocalización.

## 2. Metodología de Análisis
El análisis se realizó utilizando un enfoque de "Caja Negra" con enrutamiento de tráfico a través de la red **TOR** para evitar bloqueos por geolocalización y proteger la identidad del analista.

### A. Reconocimiento Inicial (VirusTotal)
Se consultaron bases de datos de inteligencia de amenazas para establecer una reputación base.
*   **Comando:** Búsqueda manual y API en VirusTotal.
*   **Resultado:** 12/97 motores detectan el dominio como Malicioso/Phishing.
*   **Enlace:** [Reporte VirusTotal](https://www.virustotal.com/gui/url/d5e30269b88ce272cbeeb2c4810496161397a62e345b146b8012fd8ee297a115)

### B. Escaneo de Puertos y Servicios (vía TOR)
Se utilizó `nmap` a través de `proxychains` para identificar servicios expuestos sin revelar la IP de origen.

**Comando Ejecutado:**
```bash
proxychains4 nmap -sT -Pn -n -p 80,443 -v jnmbmw.hottview.net
```

**Resultados:**
*   **Puertos:** 80 (HTTP), 443 (HTTPS) abiertos.
*   **Servidor:** Nginx (identificado posteriormente).
*   **IP:** 99.192.225.63 (US).

### C. Identificación de Tecnologías (Tech Stack)
Se utilizó `whatweb` para perfilar la tecnología del servidor web.

**Comando Ejecutado:**
```bash
proxychains4 whatweb https://jnmbmw.hottview.net
```
**Hallazgos:** Servidor Nginx, Cookies de sesión genéricas.

### D. Enumeración de Directorios y Fuzzing
Se utilizó `ffuf` para descubrir endpoints ocultos, filtrando respuestas por tamaño para evitar falsos positivos.

**Comando Ejecutado:**
```bash
ffuf -u https://jnmbmw.hottview.net/FUZZ \
     -w /usr/share/dirb/wordlists/common.txt \
     -x socks5://127.0.0.1:9050 \
     -mc 200,301,302,403 -fs 46
```

**Endpoints Descubiertos:**
1.  `/click` (302 Found) - Redireccionador principal.
2.  `/report` (200 OK) - Formulario falso de abuso.
3.  `/check` (200 OK) - Página de debug ("Mode 3 Not Implemented").
4.  `/pixel` (301 Moved) - Pixel de seguimiento.

### E. Escaneo de Vulnerabilidades (Nuclei)
Se ejecutó `nuclei` con plantillas estándar para detectar fallos de configuración conocidos.

**Comando Ejecutado:**
```bash
nuclei -u https://jnmbmw.hottview.net \
       -proxy socks5://127.0.0.1:9050 \
       -t nuclei-templates
```
**Resultado:** No se detectaron CVEs críticos de ejecución remota, confirmando que la amenaza reside en la lógica de negocio y no en el software base.

---

## 3. Análisis de Comportamiento (Ingeniería Inversa)

### Funcionalidad de Phishing (`/report`)
El sitio aloja un formulario diseñado para parecer una herramienta de seguridad legítima.
*   **Mecanismo:** Solicita un email para "verificar" un reporte de spam.
*   **Comportamiento Real:** El código JavaScript valida el email, muestra una alerta falsa de confirmación y redirige a la víctima a Google, descartando o registrando silenciosamente los datos.

### Sistema de Redirección (`/click`)
Este endpoint es el núcleo del TDS. Acepta parámetros como `url`, `dest`, `s1`, `click_id`.
*   **Lógica:** Si los parámetros coinciden con una campaña activa, redirige al malware/scam final. Si no (como en nuestro análisis), hace "fallback" a Google para parecer inofensivo ante analistas y bots.

---

## 4. Simulación y Recreación (TDS_Simulator)
Para fines educativos y de validación, se ha recreado la lógica del servidor utilizando **Node.js** y **Express**.

### Estructura del Proyecto
*   `server.js`: Servidor backend que emula las rutas `/click`, `/report`, `/check`.
*   `public/report.html`: Clon del formulario de phishing encontrado.

### Instalación y Uso
```bash
cd TDS_Simulator
npm install
node server.js
```

---

## 5. Conclusiones y Recomendaciones
El dominio `jnmbmw.hottview.net` es una infraestructura hostil activa. No presenta vulnerabilidades explotables tradicionales (RCE/SQLi) porque su función es lógica (enrutamiento).

**Acciones Recomendadas:**
1.  Bloquear el dominio y la IP `99.192.225.63` en firewalls perimetrales.
2.  Investigar logs de tráfico en busca de conexiones a endpoints `/pixel` o `/click`.

---

## 6. Publicación de Inteligencia (OTX)
Esta investigación ha sido publicada en **AlienVault Open Threat Exchange (OTX)** para contribuir a la defensa colectiva.
*   **Pulse ID:** `6961278a4a8bd4de7b59d32d`
*   **Enlace al Pulse:** [TDS Infrastructure: jnmbmw.hottview.net](https://otx.alienvault.com/pulse/6961278a4a8bd4de7b59d32d)

