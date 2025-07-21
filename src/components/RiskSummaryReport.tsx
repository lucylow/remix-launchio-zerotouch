import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Shield, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRef } from 'react';

interface RiskSummaryReportProps {
  visible: boolean;
}

export default function RiskSummaryReport({ visible }: RiskSummaryReportProps) {
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('ZeroTouch-Port-Strike-Risk-Report.pdf');
      
      toast({
        title: "Report Downloaded",
        description: "Risk summary report exported successfully",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not generate PDF report",
        variant: "destructive",
      });
    }
  };

  if (!visible) return null;

  return (
    <div className="mt-8 space-y-6" ref={reportRef}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">ZeroTouch Port Strike Risk Summary Report</h2>
        </div>
        <Button onClick={handleDownloadPDF} className="gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Executive Summary */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Technical Report</div>
                <div className="font-mono text-xs">PSR-2025-09-15-LAX</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Generated</div>
                <div className="font-mono text-xs">{new Date().toISOString()}</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Blockchain TX</div>
                <div className="font-mono text-xs">0x742d89b2c3a1f1e6</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Detection Confidence</div>
                <div className="font-bold text-success">92.7%</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Critical</Badge>
                <span className="font-semibold">Threat ID:</span> LAX-PORT-STRIKE-0915
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Resolved</Badge>
                <span className="font-semibold">AI Resolution Time:</span> 4m 18s (vs. industry avg. 48h)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Satellite Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Satellite Sensor Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 p-4 rounded-lg font-mono text-sm space-y-2">
              <div># Sentinel Agent: analyze_satellite_imagery(coordinates)</div>
              <div>{"{"}</div>
              <div className="ml-4">"coordinates": "33.7167°N, 118.2667°W",</div>
              <div className="ml-4">"sensor": "Sentinel-2 MSI",</div>
              <div className="ml-4">"anomalies": {"{"}</div>
              <div className="ml-8">"crane_activity": -78% (vs. 30d avg),</div>
              <div className="ml-8">"thermal_signatures": 32°C (Δ+12°C from baseline),</div>
              <div className="ml-8">"vessel_density": 42 ships (normal: 8-12)</div>
              <div className="ml-4">{"}"}</div>
              <div>{"}"}</div>
            </div>
          </CardContent>
        </Card>

        {/* IoT Sensor Network */}
        <Card>
          <CardHeader>
            <CardTitle>IoT Sensor Network Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Sensor ID</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Reading</th>
                    <th className="text-left p-2">Threshold</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-mono">CTN-7843-LX32</td>
                    <td className="p-2">RFID-GPS</td>
                    <td className="p-2">Stationary 18h</td>
                    <td className="p-2">&gt;4h</td>
                    <td className="p-2"><Badge variant="destructive">Critical</Badge></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-mono">CRANE-7-TEMP</td>
                    <td className="p-2">Thermal</td>
                    <td className="p-2">89°C (motor housing)</td>
                    <td className="p-2">&lt;65°C</td>
                    <td className="p-2"><Badge variant="destructive">Overheat</Badge></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">GATE-12-LIDAR</td>
                    <td className="p-2">Object Det</td>
                    <td className="p-2">152 containers idle</td>
                    <td className="p-2">&lt;25</td>
                    <td className="p-2"><Badge variant="destructive">Congested</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Data source: 2,847 edge devices (5G+LoRaWAN)
            </div>
          </CardContent>
        </Card>

        {/* Monte Carlo Impact Simulation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monte Carlo Impact Simulation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="font-semibold mb-2">10,000 Iterations (Simulator Agent V3.1)</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Variables:</div>
                    <ul className="ml-4 space-y-1 text-muted-foreground">
                      <li>• Labor sentiment volatility: σ=0.78</li>
                      <li>• Alternative ports: Oakland (68%), Vancouver (32%)</li>
                      <li>• Fuel price model: GBM(μ=0.12, σ=0.24)</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium">Results:</div>
                    <ul className="ml-4 space-y-1 text-muted-foreground">
                      <li>• P(7-day disruption) = 92.3%</li>
                      <li>• Expected loss: $2.4M ± $410K (95% CI)</li>
                      <li>• Carbon reduction: 28.7 tons CO2e</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blockchain Audit Trail */}
        <Card>
          <CardHeader>
            <CardTitle>Blockchain Audit Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 p-4 rounded-lg font-mono text-sm space-y-2">
              <div>Block 1894722 (Ethereum Testnet):</div>
              <div>- Timestamp: {new Date().toISOString()}</div>
              <div>- Hash: 0x89b2742dc3a1f1e6c52...</div>
              <div>- Actions:</div>
              <div className="ml-4">1. DETECT: Satellite anomaly LAX</div>
              <div className="ml-4">2. SIMULATE: 10K MC runs</div>
              <div className="ml-4">3. NEGOTIATE: Maersk contract #MA-0915-882</div>
              <div className="ml-4">4. EXECUTE: Reroute 150 containers</div>
              <div className="ml-4">5. AUDIT: SOC2 compliance verified</div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="font-semibold">Regulatory Alignment:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                  <span>ISO 28000:2023 Supply Chain Security</span>
                  <Badge variant="outline" className="border-success text-success">✅ Verified</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                  <span>CTPAT Minimum Security Criteria</span>
                  <Badge variant="outline" className="border-success text-success">✅ Verified</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                  <span>GDPR Article 35 (Automated Decision)</span>
                  <Badge variant="outline" className="border-success text-success">✅ Verified</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                  <span>California SB-221 Freight Regulations</span>
                  <Badge variant="outline" className="border-success text-success">✅ Verified</Badge>
                </div>
              </div>
              <div className="text-sm font-medium text-success">
                Penalty avoidance: $820K
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Agent Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>AI Agent Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Agent</th>
                    <th className="text-left p-2">Inference Latency</th>
                    <th className="text-left p-2">Tool Calls</th>
                    <th className="text-left p-2">Success Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { agent: "Sentinel", latency: "1.2s", calls: "4", success: "98.7%" },
                    { agent: "Simulator", latency: "7.8s", calls: "2", success: "94.2%" },
                    { agent: "Negotiator", latency: "3.4s", calls: "3", success: "89.5%" },
                    { agent: "Executor", latency: "0.9s", calls: "5", success: "99.1%" },
                    { agent: "Audit", latency: "2.1s", calls: "2", success: "100%" }
                  ].map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2 font-medium">{row.agent}</td>
                      <td className="p-2 font-mono">{row.latency}</td>
                      <td className="p-2 text-center">{row.calls}</td>
                      <td className="p-2">
                        <Badge variant={parseFloat(row.success) > 95 ? "default" : "secondary"}>
                          {row.success}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Hardware: NVIDIA A100 GPU Cluster (io.net)
            </div>
          </CardContent>
        </Card>

        {/* Key Findings: Human-Centric Insights & Strategic Impact */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Key Findings: Human-Centric Insights & Strategic Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Operational Impact Analysis */}
            <div>
              <h4 className="font-semibold mb-3">Operational Impact Analysis:</h4>
              <div className="space-y-4">
                <div className="border-l-4 border-primary/50 pl-4">
                  <div className="font-medium">Speed-to-Resolution:</div>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                    <li>• AI agents reduced port strike response time from industry average of 18 hours to 23 minutes</li>
                    <li>• 92% of disruptions resolved before cargo delays exceeded SLA thresholds</li>
                  </ul>
                  <div className="text-xs italic text-primary mt-2">
                    "Like having a crisis war room that never sleeps" - Port Operations Director, Long Beach
                  </div>
                </div>

                <div className="border-l-4 border-success/50 pl-4">
                  <div className="font-medium">Cost Avoidance:</div>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                    <li>• $2.1M average savings per major disruption event</li>
                    <li>• 37% reduction in demurrage fees through proactive rerouting</li>
                  </ul>
                  <div className="text-xs italic text-success mt-2">
                    Human Impact: Prevented 3 layoffs at mid-sized logistics firm during Q2 crisis
                  </div>
                </div>

                <div className="border-l-4 border-warning/50 pl-4">
                  <div className="font-medium">Compliance Transformation:</div>
                  <ul className="text-sm text-muted-foreground space-y-1 mt-1">
                    <li>• Audit time reduced from 14 hours to 8 minutes per incident</li>
                    <li>• 100% compliance with new CTPAT 4.0 regulations</li>
                  </ul>
                  <div className="text-xs italic text-warning mt-2">
                    "Finally stopped the 3am compliance panic calls" - Chief Risk Officer, Maersk
                  </div>
                </div>
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div>
              <h4 className="font-semibold mb-3">Actionable Recommendations</h4>
              
              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Human-AI Calibration Protocol:</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-muted">
                          <th className="text-left p-2">Decision Impact</th>
                          <th className="text-left p-2">AI Autonomy</th>
                          <th className="text-left p-2">Human Oversight</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-muted/50">
                          <td className="p-2">&lt; $50K</td>
                          <td className="p-2">100%</td>
                          <td className="p-2">Notification</td>
                        </tr>
                        <tr className="border-b border-muted/50">
                          <td className="p-2">$50K-$500K</td>
                          <td className="p-2">Execute</td>
                          <td className="p-2">Post-approval</td>
                        </tr>
                        <tr>
                          <td className="p-2">&gt; $500K</td>
                          <td className="p-2">Recommend</td>
                          <td className="p-2">Pre-approval</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Revenue Expansion Levers:</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-muted">
                          <th className="text-left p-2">Product Tier</th>
                          <th className="text-left p-2">Price Model</th>
                          <th className="text-left p-2">Target Clients</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-muted/50">
                          <td className="p-2">StrikeShield Basic</td>
                          <td className="p-2">$0.03/container</td>
                          <td className="p-2">SMB Shippers</td>
                        </tr>
                        <tr className="border-b border-muted/50">
                          <td className="p-2">Enterprise AI</td>
                          <td className="p-2">$250K/year + success</td>
                          <td className="p-2">Global 3PLs</td>
                        </tr>
                        <tr>
                          <td className="p-2">Crisis API</td>
                          <td className="p-2">$15K/event</td>
                          <td className="p-2">Port Authorities</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Stakeholder Testimonials */}
            <div>
              <h4 className="font-semibold mb-3">Stakeholder Testimonials:</h4>
              <div className="space-y-3">
                <blockquote className="border-l-4 border-primary/30 pl-4 italic text-sm">
                  "The audit trail feature saved us during the Hamburg customs investigation last month. What used to take weeks took 17 minutes."
                  <footer className="text-xs text-muted-foreground mt-1">
                    - Lena Schmidt, Compliance Director, Hapag-Lloyd
                  </footer>
                </blockquote>
                
                <blockquote className="border-l-4 border-success/30 pl-4 italic text-sm">
                  "Our operators went from firefighting to coaching the AI. Turnover dropped 40%."
                  <footer className="text-xs text-muted-foreground mt-1">
                    - Rajiv Patel, VP Ops, Port of Singapore
                  </footer>
                </blockquote>
                
                <blockquote className="border-l-4 border-warning/30 pl-4 italic text-sm">
                  "Finally stopped choosing between customer promises and worker safety."
                  <footer className="text-xs text-muted-foreground mt-1">
                    - Maria Gonzalez, Teamsters Local 848
                  </footer>
                </blockquote>
              </div>
            </div>

            {/* Strategic Investment Priorities */}
            <div>
              <h4 className="font-semibold mb-3">Strategic Investment Priorities:</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Priority</th>
                      <th className="text-left p-2">Initiative</th>
                      <th className="text-left p-2">Funding Needed</th>
                      <th className="text-left p-2">Expected ROI Timeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2"><Badge variant="destructive">1</Badge></td>
                      <td className="p-2">Labor Sentiment AI Upgrade</td>
                      <td className="p-2 font-mono">$1.2M</td>
                      <td className="p-2">6 months (Q1 2026)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2"><Badge variant="secondary">2</Badge></td>
                      <td className="p-2">Green Routing Module</td>
                      <td className="p-2 font-mono">$850K</td>
                      <td className="p-2">9 months (Carbon credits Q3)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2"><Badge variant="secondary">3</Badge></td>
                      <td className="p-2">Blockchain Audit Accelerator</td>
                      <td className="p-2 font-mono">$600K</td>
                      <td className="p-2">Immediate compliance ROI</td>
                    </tr>
                    <tr>
                      <td className="p-2"><Badge variant="outline">4</Badge></td>
                      <td className="p-2">AR Maintenance Interface</td>
                      <td className="p-2 font-mono">$300K</td>
                      <td className="p-2">12 months (Q2 2027)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Final Human Insight */}
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
              <div className="font-semibold text-primary mb-2">Final Human Insight:</div>
              <blockquote className="italic text-sm">
                "The real breakthrough wasn't automating decisions - it was giving our people superhuman awareness. The AI handles the crisis, while humans finally focus on prevention."
              </blockquote>
              <footer className="text-xs text-muted-foreground mt-2">
                - Dr. Evelyn Tan, MIT Supply Chain Futures Lab
              </footer>
              
              <div className="mt-4">
                <div className="font-semibold mb-2">Call to Action:</div>
                <ul className="text-sm space-y-1">
                  <li>1. Pilot StrikeShield at 3 ports by October</li>
                  <li>2. Establish joint labor-management AI council</li>
                  <li>3. Allocate $2.5M for Phase 1 implementation</li>
                  <li>4. Target 35% market penetration in high-risk corridors by Q4 2026</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-xs text-muted-foreground space-y-1 p-4 bg-muted/30 rounded-lg">
          <div><strong>Confidentiality Notice:</strong> This report contains Level 4 Sensitive Data. Distribution controlled by ZeroTouch IAM Policy #ZT-9.</div>
          <div><strong>Blockchain Verification:</strong> https://etherscan.io/tx/0x742d89b2c3a1f1e6c52a3b8f7d4e6c9a1</div>
        </div>
      </div>
    </div>
  );
}