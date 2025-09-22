let currentRole = 'backend';
        let uploadedFiles = [];
        let analysisData = {};

        // Initialize Mermaid
        mermaid.initialize({ startOnLoad: true, theme: 'default' });

        // Role switching
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentRole = btn.dataset.role;
                updateCurrentRoleDisplay();
                if (uploadedFiles.length > 0) {
                    analyzeCodebase();
                }
            });
        });

        // File upload handling
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });

        function handleFiles(files) {
            uploadedFiles = Array.from(files);
            displayFileList();
            analyzeCodebase();
        }

        function displayFileList() {
            const fileList = document.getElementById('fileList');
            if (uploadedFiles.length === 0) {
                fileList.style.display = 'none';
                return;
            }

            fileList.style.display = 'block';
            fileList.innerHTML = '<h4>📁 Uploaded Files:</h4>' + 
                uploadedFiles.map(file => `
                    <div class="file-item">
                        <span>📄 ${file.name}</span>
                        <span style="color: #666;">${(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                `).join('');
        }

        function updateCurrentRoleDisplay() {
            const roleIcons = {
                'backend': '👨‍💻 Backend Engineer View',
                'frontend': '🎨 Frontend Developer View', 
                'ai': '🤖 AI Engineer View',
                'pm': '📊 Product Manager View'
            };
            document.getElementById('currentRole').textContent = roleIcons[currentRole];
        }

        async function analyzeCodebase() {
            if (uploadedFiles.length === 0) return;

            showLoading();
            
            try {
                // Simulate file analysis
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Process files
                const codeContent = await Promise.all(uploadedFiles.map(async file => {
                    const text = await file.text();
                    return { name: file.name, content: text, type: getFileType(file.name) };
                }));

                analysisData = analyzeContent(codeContent);
                renderRoleSpecificView();
                
            } catch (error) {
                console.error('Analysis error:', error);
            } finally {
                hideLoading();
            }
        }

        function getFileType(filename) {
            const ext = filename.split('.').pop().toLowerCase();
            const types = {
                'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
                'py': 'python', 'java': 'java', 'cpp': 'cpp', 'c': 'c',
                'html': 'html', 'css': 'css', 'json': 'json', 'md': 'markdown'
            };
            return types[ext] || 'text';
        }

        function analyzeContent(files) {
            const analysis = {
                totalFiles: files.length,
                totalLines: files.reduce((sum, f) => sum + f.content.split('\n').length, 0),
                languages: [...new Set(files.map(f => f.type))],
                complexity: Math.floor(Math.random() * 100) + 1,
                apiEndpoints: extractApiEndpoints(files),
                components: extractComponents(files),
                dataModels: extractDataModels(files),
                dependencies: extractDependencies(files)
            };

            return analysis;
        }

        function extractApiEndpoints(files) {
            const endpoints = [];
            files.forEach(file => {
                const lines = file.content.split('\n');
                lines.forEach(line => {
                    if (line.includes('app.get') || line.includes('app.post') || line.includes('@RequestMapping')) {
                        const match = line.match(/['"`]([^'"`]+)['"`]/);
                        if (match) endpoints.push(match[1]);
                    }
                });
            });
            return endpoints.slice(0, 10);
        }

        function extractComponents(files) {
            const components = [];
            files.forEach(file => {
                if (file.type === 'javascript') {
                    const matches = file.content.match(/(?:function|const|class)\s+([A-Z][a-zA-Z0-9]*)/g);
                    if (matches) {
                        matches.forEach(match => {
                            const name = match.split(/\s+/)[1];
                            if (name && name[0] === name[0].toUpperCase()) {
                                components.push(name);
                            }
                        });
                    }
                }
            });
            return [...new Set(components)].slice(0, 10);
        }

        function extractDataModels(files) {
            const models = [];
            files.forEach(file => {
                const classMatches = file.content.match(/class\s+([A-Z][a-zA-Z0-9]*)/g);
                if (classMatches) {
                    classMatches.forEach(match => {
                        models.push(match.split(/\s+/)[1]);
                    });
                }
            });
            return [...new Set(models)].slice(0, 8);
        }

        function extractDependencies(files) {
            const deps = new Set();
            files.forEach(file => {
                const imports = file.content.match(/(?:import|require|from)\s+['"`]([^'"`]+)['"`]/g);
                if (imports) {
                    imports.forEach(imp => {
                        const match = imp.match(/['"`]([^'"`]+)['"`]/);
                        if (match) deps.add(match[1]);
                    });
                }
            });
            return Array.from(deps).slice(0, 15);
        }

        function renderRoleSpecificView() {
            const roleViews = {
                backend: renderBackendView,
                frontend: renderFrontendView,
                ai: renderAIView,
                pm: renderPMView
            };
            
            roleViews[currentRole]();
            renderMetrics();
        }

        function renderBackendView() {
            document.getElementById('analysisOutput').innerHTML = `
                <h4>🔧 Server Architecture Analysis</h4>
                <div class="code-preview">
API Endpoints Found: ${analysisData.apiEndpoints.length}
${analysisData.apiEndpoints.map(ep => `• ${ep}`).join('\n')}

Data Models: ${analysisData.dataModels.length}
${analysisData.dataModels.map(model => `• ${model}`).join('\n')}

Dependencies: ${analysisData.dependencies.length}
</div>
                <div class="recommendation-box">
                    <strong>💡 Recommendations:</strong><br>
                    • Consider implementing API rate limiting<br>
                    • Add input validation middleware<br>
                    • Implement proper error handling
                </div>
            `;

            renderDiagram('backend');
            renderInsights('backend');
        }

        function renderFrontendView() {
            document.getElementById('analysisOutput').innerHTML = `
                <h4>🎨 UI Component Analysis</h4>
                <div class="code-preview">
Components Found: ${analysisData.components.length}
${analysisData.components.map(comp => `• ${comp}Component`).join('\n')}

Styling Files: ${uploadedFiles.filter(f => f.name.endsWith('.css')).length}
JavaScript Files: ${uploadedFiles.filter(f => f.name.endsWith('.js') || f.name.endsWith('.jsx')).length}
</div>
                <div class="recommendation-box">
                    <strong>💡 UI/UX Recommendations:</strong><br>
                    • Implement responsive design patterns<br>
                    • Add loading states for better UX<br>
                    • Consider component reusability
                </div>
            `;

            renderDiagram('frontend');
            renderInsights('frontend');
        }

        function renderAIView() {
            document.getElementById('analysisOutput').innerHTML = `
                <h4>🤖 ML/AI Pipeline Analysis</h4>
                <div class="code-preview">
Data Processing Files: ${uploadedFiles.filter(f => f.name.includes('data') || f.name.includes('model')).length}
Python Files: ${uploadedFiles.filter(f => f.name.endsWith('.py')).length}

Potential ML Libraries:
${analysisData.dependencies.filter(dep => ['numpy', 'pandas', 'sklearn', 'tensorflow', 'pytorch'].some(lib => dep.includes(lib))).map(lib => `• ${lib}`).join('\n') || '• No ML libraries detected'}
</div>
                <div class="recommendation-box">
                    <strong>💡 ML Recommendations:</strong><br>
                    • Implement data validation pipelines<br>
                    • Add model versioning<br>
                    • Consider A/B testing framework
                </div>
            `;

            renderDiagram('ai');
            renderInsights('ai');
        }

        function renderPMView() {
            document.getElementById('analysisOutput').innerHTML = `
                <h4>📊 Project Overview</h4>
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <p><strong>Project Health:</strong> ${analysisData.complexity < 50 ? '🟢 Good' : analysisData.complexity < 80 ? '🟡 Moderate' : '🔴 Complex'}</p>
                    <p><strong>Technology Stack:</strong> ${analysisData.languages.join(', ')}</p>
                    <p><strong>Estimated Effort:</strong> ${Math.ceil(analysisData.totalLines / 100)} developer-days</p>
                    <p><strong>Maintainability:</strong> ${analysisData.complexity < 60 ? 'High' : 'Medium'}</p>
                </div>
                <div class="recommendation-box">
                    <strong>📈 Strategic Recommendations:</strong><br>
                    • Focus on ${analysisData.complexity > 70 ? 'code refactoring' : 'feature development'}<br>
                    • Consider automated testing coverage<br>
                    • Plan for ${analysisData.totalFiles > 50 ? 'modularization' : 'scaling'}
                </div>
            `;

            renderDiagram('pm');
            renderInsights('pm');
        }

        function renderDiagram(role) {
            const diagramContainer = document.getElementById('diagramContainer');
            
            const diagrams = {
                backend: `
                    <div class="mermaid">
                    graph TD
                        A[Client Request] --> B[API Gateway]
                        B --> C[Authentication]
                        C --> D[Business Logic]
                        D --> E[Database]
                        D --> F[External APIs]
                        E --> G[Response]
                        F --> G
                    </div>
                `,
                frontend: `
                    <div class="mermaid">
                    graph TD
                        A[User Interface] --> B[Component Layer]
                        B --> C[State Management]
                        C --> D[API Layer]
                        D --> E[Backend Services]
                        B --> F[UI Components]
                        F --> G[Styled Components]
                    </div>
                `,
                ai: `
                    <div class="mermaid">
                    graph TD
                        A[Raw Data] --> B[Data Processing]
                        B --> C[Feature Engineering]
                        C --> D[Model Training]
                        D --> E[Model Validation]
                        E --> F[Deployment]
                        F --> G[Monitoring]
                        G --> H[Retraining]
                    </div>
                `,
                pm: `
                    <div class="mermaid">
                    graph TD
                        A[Requirements] --> B[Architecture]
                        B --> C[Development]
                        C --> D[Testing]
                        D --> E[Deployment]
                        E --> F[Monitoring]
                        F --> G[Feedback]
                        G --> A
                    </div>
                `
            };

            diagramContainer.innerHTML = diagrams[role];
            mermaid.init(undefined, diagramContainer.querySelector('.mermaid'));
        }

        function renderInsights(role) {
            const insights = {
                backend: `
                    <h4>🔧 Backend Insights</h4>
                    <p><strong>Architecture Pattern:</strong> ${analysisData.apiEndpoints.length > 10 ? 'Microservices' : 'Monolithic'}</p>
                    <p><strong>API Design:</strong> ${analysisData.apiEndpoints.length > 0 ? 'RESTful endpoints detected' : 'No clear API structure'}</p>
                    <p><strong>Security:</strong> Consider implementing OAuth2 and input sanitization</p>
                    <p><strong>Performance:</strong> Database optimization and caching recommended</p>
                `,
                frontend: `
                    <h4>🎨 Frontend Insights</h4>
                    <p><strong>Component Architecture:</strong> ${analysisData.components.length > 5 ? 'Well-structured' : 'Needs organization'}</p>
                    <p><strong>Bundle Size:</strong> Consider code splitting for better performance</p>
                    <p><strong>Accessibility:</strong> Implement ARIA labels and keyboard navigation</p>
                    <p><strong>Testing:</strong> Add unit tests for critical components</p>
                `,
                ai: `
                    <h4>🤖 AI/ML Insights</h4>
                    <p><strong>Data Pipeline:</strong> ${uploadedFiles.some(f => f.name.includes('data')) ? 'Data processing detected' : 'No clear data pipeline'}</p>
                    <p><strong>Model Management:</strong> Implement MLOps practices</p>
                    <p><strong>Scalability:</strong> Consider containerization for model deployment</p>
                    <p><strong>Monitoring:</strong> Add model performance tracking</p>
                `,
                pm: `
                    <h4>📊 Project Management Insights</h4>
                    <p><strong>Project Scope:</strong> ${analysisData.totalFiles > 50 ? 'Large-scale project' : 'Medium-scale project'}</p>
                    <p><strong>Team Size:</strong> Estimated ${Math.ceil(analysisData.totalFiles / 20)} developers needed</p>
                    <p><strong>Timeline:</strong> Approximately ${Math.ceil(analysisData.totalLines / 500)} weeks for completion</p>
                    <p><strong>Risk Assessment:</strong> ${analysisData.complexity > 70 ? 'High complexity - plan for additional testing' : 'Manageable complexity'}</p>
                `
            };

            document.getElementById('insightsOutput').innerHTML = insights[role];
        }

        function renderMetrics() {
            const metricsGrid = document.getElementById('metricsGrid');
            metricsGrid.innerHTML = `
                <div class="metric-card">
                    <div class="metric-value">${analysisData.totalFiles}</div>
                    <div>Files</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${analysisData.totalLines.toLocaleString()}</div>
                    <div>Lines</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${analysisData.languages.length}</div>
                    <div>Languages</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${analysisData.complexity}%</div>
                    <div>Complexity</div>
                </div>
            `;
        }

        function showLoading() {
            document.getElementById('loading').style.display = 'flex';
        }

        function hideLoading() {
            document.getElementById('loading').style.display = 'none';
        }

        // Initialize
        updateCurrentRoleDisplay();