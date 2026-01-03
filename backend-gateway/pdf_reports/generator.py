from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_RIGHT
import os
import json

REPORT_DIR = "shared_data/reports"
os.makedirs(REPORT_DIR, exist_ok=True)

def generate_pdf_report(document_id: int, agent_results: dict, filename: str) -> str:
    """
    Generate combined PDF report from all agent results
    
    Args:
        document_id: Document ID
        agent_results: Dictionary of agent results
        filename: Original filename
    
    Returns:
        Path to generated PDF report
    """
    report_path = f"{REPORT_DIR}/{document_id}_report.pdf"
    doc = SimpleDocTemplate(report_path, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Add custom style for metadata
    metadata_style = ParagraphStyle(
        'Metadata',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey,
        alignment=TA_RIGHT
    )
    
    story = []

    # Title
    story.append(Paragraph(f"<b>Legal Document Analysis Report</b>", styles['Title']))
    story.append(Paragraph(f"Document: {filename}", styles['Heading2']))
    story.append(Spacer(1, 12))

    # Summary Agent
    if 'summary' in agent_results and 'error' not in agent_results['summary']:
        data = agent_results['summary']
        story.append(Paragraph("Executive Summary", styles['Heading1']))
        story.append(Paragraph(f"<i>Analyzed by: {data.get('model_used', 'Unknown Model')}</i>", metadata_style))
        story.append(Spacer(1, 6))
        story.append(Paragraph(data.get('summary', 'No summary provided.'), styles['BodyText']))
        story.append(Spacer(1, 12))

    # Risk Agent
    if 'risk' in agent_results and 'error' not in agent_results['risk']:
        story.append(Paragraph("Risk Analysis", styles['Heading1']))
        risk_data = agent_results['risk']
        story.append(Paragraph(f"<i>Analyzed by: {risk_data.get('model_used', 'Unknown Model')}</i>", metadata_style))
        story.append(Spacer(1, 6))
        story.append(Paragraph(f"<b>Overall Risk Score:</b> {risk_data.get('risk_percentage', 0)}%", styles['BodyText']))
        story.append(Paragraph(f"<b>Confidence:</b> {risk_data.get('confidence_percentage', 0)}%", styles['BodyText']))
        story.append(Spacer(1, 6))
        
        risks = risk_data.get('detailed_analysis', {}).get('identified_risks', [])
        if risks:
            data_table = [['Risk Type', 'Severity', 'Description', 'Risk %']]
            for risk in risks:
                data_table.append([
                    risk.get('risk_type', ''),
                    risk.get('severity', ''),
                    risk.get('description', '')[:100] + '...' if len(risk.get('description', '')) > 100 else risk.get('description', ''),
                    f"{risk.get('risk_percentage', 0)}%"
                ])
            
            t = Table(data_table, colWidths=[100, 80, 250, 60])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            story.append(t)
        story.append(Spacer(1, 12))

    # Clause Agent
    if 'clause' in agent_results and 'error' not in agent_results['clause']:
        story.append(Paragraph("Key Clauses Analysis", styles['Heading1']))
        clause_data = agent_results['clause']
        story.append(Paragraph(f"<i>Analyzed by: {clause_data.get('model_used', 'Unknown Model')}</i>", metadata_style))
        story.append(Spacer(1, 6))
        
        clauses = clause_data.get('key_insights', [])
        for clause in clauses:
            story.append(Paragraph(f"<b>{clause.get('clause_name', 'Clause')}</b> ({clause.get('clause_type', 'Type')})", styles['Heading3']))
            story.append(Paragraph(f"<b>Summary:</b> {clause.get('summary', '')}", styles['BodyText']))
            story.append(Paragraph(f"<b>Risk Level:</b> {clause.get('risk_level', '')} - {clause.get('risk_description', '')}", styles['BodyText']))
            story.append(Paragraph(f"<b>Confidence:</b> {clause.get('confidence_percentage', 'N/A')}%", styles['BodyText']))
            story.append(Spacer(1, 8))
        story.append(Spacer(1, 12))

    # Draft Agent
    if 'draft' in agent_results and 'error' not in agent_results['draft']:
        story.append(Paragraph("Drafting Suggestions", styles['Heading1']))
        draft_data = agent_results['draft']
        story.append(Paragraph(f"<i>Analyzed by: {draft_data.get('model_used', 'Unknown Model')}</i>", metadata_style))
        story.append(Spacer(1, 6))
        
        suggestions = draft_data.get('ai_suggestions', [])
        for idx, suggestion in enumerate(suggestions, 1):
            story.append(Paragraph(f"<b>Issue {idx}:</b> {suggestion.get('issue', '')}", styles['BodyText']))
            story.append(Paragraph(f"<b>Location:</b> {suggestion.get('location', '')}", styles['BodyText']))
            story.append(Paragraph(f"<b>Problem:</b> {suggestion.get('problem', '')}", styles['BodyText']))
            story.append(Paragraph(f"<b>Suggested Revision:</b> {suggestion.get('suggested_revision', '')}", styles['BodyText']))
            story.append(Spacer(1, 8))

    # Add footer with metadata
    story.append(Spacer(1, 20))
    story.append(Paragraph(f"<i>Report generated for document ID: {document_id}</i>", metadata_style))

    doc.build(story)
    return report_path

def generate_agent_report(document_id: int, agent_name: str, data: dict, filename: str) -> str:
    """
    Generate individual agent report
    
    Args:
        document_id: Document ID
        agent_name: Name of the agent
        data: Agent analysis data
        filename: Original filename
    
    Returns:
        Path to generated PDF report
        
    Raises:
        ValueError: If data contains an error
    """
    # Check for errors in the data
    if 'error' in data:
        raise ValueError(f"Cannot generate report for {agent_name}: {data.get('error')}")
    
    report_path = f"{REPORT_DIR}/{document_id}_{agent_name}_report.pdf"
    doc = SimpleDocTemplate(report_path, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Add custom style for metadata
    metadata_style = ParagraphStyle(
        'Metadata',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey,
        alignment=TA_RIGHT
    )
    
    story = []

    # Title
    story.append(Paragraph(f"<b>{agent_name.capitalize()} Analysis Report</b>", styles['Title']))
    story.append(Paragraph(f"Document: {filename}", styles['Heading2']))
    story.append(Paragraph(f"<i>Analyzed by: {data.get('model_used', 'Unknown Model')}</i>", metadata_style))
    story.append(Spacer(1, 12))

    if agent_name == 'summary':
        story.append(Paragraph("Executive Summary", styles['Heading1']))
        story.append(Paragraph(data.get('summary', 'No summary provided.'), styles['BodyText']))
        story.append(Spacer(1, 12))
        
        # Add key insights
        insights = data.get('key_insights', [])
        if insights:
            story.append(Paragraph("Key Insights", styles['Heading2']))
            for insight in insights:
                story.append(Paragraph(f"• {insight}", styles['BodyText']))
            story.append(Spacer(1, 12))
        
    elif agent_name in ['risk_detection', 'risk']:
        story.append(Paragraph("Risk Analysis", styles['Heading1']))
        story.append(Paragraph(f"<b>Overall Risk Score:</b> {data.get('risk_percentage', 0)}%", styles['BodyText']))
        story.append(Paragraph(f"<b>Confidence:</b> {data.get('confidence_percentage', 0)}%", styles['BodyText']))
        story.append(Spacer(1, 12))
        
        risks = data.get('detailed_analysis', {}).get('identified_risks', [])
        if risks:
            story.append(Paragraph("Identified Risks", styles['Heading2']))
            table_data = [['Risk Type', 'Severity', 'Description', 'Risk %']]
            for risk in risks:
                table_data.append([
                    risk.get('risk_type', ''),
                    risk.get('severity', ''),
                    risk.get('description', '')[:100] + '...' if len(risk.get('description', '')) > 100 else risk.get('description', ''),
                    f"{risk.get('risk_percentage', 0)}%"
                ])
            t = Table(table_data, colWidths=[100, 80, 250, 60])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            story.append(t)

    elif agent_name == 'clause':
        story.append(Paragraph("Key Clauses Analysis", styles['Heading1']))
        clauses = data.get('key_insights', [])
        for clause in clauses:
            story.append(Paragraph(f"<b>{clause.get('clause_name', 'Clause')}</b> ({clause.get('clause_type', 'Type')})", styles['Heading3']))
            story.append(Paragraph(f"<b>Summary:</b> {clause.get('summary', '')}", styles['BodyText']))
            story.append(Paragraph(f"<b>Risk Level:</b> {clause.get('risk_level', '')} - {clause.get('risk_description', '')}", styles['BodyText']))
            story.append(Paragraph(f"<b>Confidence:</b> {clause.get('confidence_percentage', 'N/A')}%", styles['BodyText']))
            story.append(Spacer(1, 10))

    elif agent_name == 'draft':
        story.append(Paragraph("Drafting Suggestions", styles['Heading1']))
        suggestions = data.get('ai_suggestions', [])
        for idx, suggestion in enumerate(suggestions, 1):
            story.append(Paragraph(f"<b>Issue {idx}:</b> {suggestion.get('issue', '')}", styles['BodyText']))
            story.append(Paragraph(f"<b>Location:</b> {suggestion.get('location', '')}", styles['BodyText']))
            story.append(Paragraph(f"<b>Problem:</b> {suggestion.get('problem', '')}", styles['BodyText']))
            story.append(Paragraph(f"<b>Suggested Revision:</b> {suggestion.get('suggested_revision', '')}", styles['BodyText']))
            story.append(Spacer(1, 10))

    # Add footer
    story.append(Spacer(1, 20))
    story.append(Paragraph(f"<i>Report generated for document ID: {document_id}</i>", metadata_style))

    doc.build(story)
    return report_path
