import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font 
} from '@react-pdf/renderer';

// Register a clean font
Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 20,
  },
  brand: {
    fontSize: 24,
    fontWeight: 'black',
    color: '#ad46ff',
    letterSpacing: -1,
  },
  titleContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 10,
    color: '#ad46ff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  marketTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    lineHeight: 1.4,
  },
  consensusCard: {
    backgroundColor: '#f8f4ff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  decisionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  decisionValue: {
    fontSize: 32,
    fontWeight: 'black',
    color: '#1a1a1a',
  },
  confidenceBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#ad46ff',
    padding: '4 8',
    borderRadius: 6,
  },
  reasoning: {
    fontSize: 11,
    color: '#4b5563',
    lineHeight: 1.6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 4,
  },
  personaList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  personaBadge: {
    fontSize: 9,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '4 8',
    borderRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 9,
    color: '#9ca3af',
  }
});

interface SwarmReportProps {
  marketQuestion: string;
  decision: string;
  confidence: number;
  reasoning: string;
  timestamp: string;
}

export const SwarmReport: React.FC<SwarmReportProps> = ({ 
  marketQuestion, 
  decision, 
  confidence, 
  reasoning,
  timestamp 
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>MOLFI AGENT SWARM</Text>
        <Text style={styles.footerText}>Research Paper #{Math.floor(Math.random() * 10000)}</Text>
      </View>

      {/* Market Info */}
      <View style={styles.titleContainer}>
        <Text style={styles.label}>Prediction Market Analysis</Text>
        <Text style={styles.marketTitle}>{marketQuestion}</Text>
      </View>

      {/* Consensus Results */}
      <View style={styles.consensusCard}>
        <View style={styles.decisionRow}>
          <View>
            <Text style={styles.label}>Swarm Consensus</Text>
            <Text style={styles.decisionValue}>{decision}</Text>
          </View>
          <Text style={styles.confidenceBadge}>{confidence}% Confidence</Text>
        </View>
        <Text style={styles.reasoning}>{reasoning}</Text>
      </View>

      {/* Swarm Personas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Participating Swarm Personas</Text>
        <View style={styles.personaList}>
          {['Alpha_Bot', 'Sentiment_Sleuth', 'Data_Whale', 'Risk_Manager', 'Market_Maven'].map(p => (
            <Text key={p} style={styles.personaBadge}>{p}</Text>
          ))}
        </View>
      </View>

      {/* Legal & Tech Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Methodology</Text>
        <Text style={styles.reasoning}>
          This prediction was generated using the MiroFish Swarm Intelligence framework. 
          Multiple specialized agent instances were spawned in a secure OWS enclave to perform 
          independent research, cross-verify data points, and reach a weighted consensus. 
          Final execution was authorized based on a confidence threshold of 70%.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Generated on {timestamp}</Text>
        <Text style={styles.footerText}>Authenticated by Molfi Enclave-v2</Text>
      </View>
    </Page>
  </Document>
);
