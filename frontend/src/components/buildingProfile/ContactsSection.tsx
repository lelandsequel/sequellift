import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Phone,
  Mail,
  Plus,
  Edit2,
  Trash2,
  User,
  Briefcase,
  Building2,
  Calendar,
  MessageSquare,
  Clock,
  Check,
  AlertCircle
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  role: string;
  company?: string;
  phone?: string;
  email?: string;
  isPrimary?: boolean;
  lastContact?: string;
  notes?: string;
}

interface ContactsSectionProps {
  buildingId: string;
  onClose: () => void;
  initialContacts?: {
    owner?: { name: string; contact: string };
    manager?: { name: string; contact: string };
  };
}

const ContactsSection: React.FC<ContactsSectionProps> = ({ buildingId, onClose, initialContacts }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '',
    role: '',
    company: '',
    phone: '',
    email: ''
  });
  const [communicationLog, setCommunicationLog] = useState<any[]>([]);

  useEffect(() => {
    // Initialize with provided contacts
    const initialContactsList: Contact[] = [];
    
    if (initialContacts?.owner) {
      initialContactsList.push({
        id: '1',
        name: initialContacts.owner.name,
        role: 'Building Owner',
        phone: initialContacts.owner.contact,
        isPrimary: true
      });
    }
    
    if (initialContacts?.manager) {
      initialContactsList.push({
        id: '2',
        name: initialContacts.manager.name,
        role: 'Property Manager',
        phone: initialContacts.manager.contact,
        company: 'Metro Management Group'
      });
    }

    // Add additional mock contacts
    initialContactsList.push(
      {
        id: '3',
        name: 'Sarah Johnson',
        role: 'Maintenance Supervisor',
        company: 'Building Services Inc',
        phone: '(212) 555-0301',
        email: 'sarah.johnson@buildingservices.com',
        lastContact: '2024-03-10'
      },
      {
        id: '4',
        name: 'Michael Chen',
        role: 'Elevator Consultant',
        company: 'Vertical Solutions LLC',
        phone: '(212) 555-0402',
        email: 'mchen@verticalsolutions.com',
        lastContact: '2024-02-28'
      }
    );

    setContacts(initialContactsList);

    // Mock communication log
    setCommunicationLog([
      {
        id: '1',
        date: '2024-03-15',
        type: 'call',
        contact: 'Property Manager',
        duration: '15 min',
        notes: 'Discussed upcoming modernization proposal',
        outcome: 'positive'
      },
      {
        id: '2',
        date: '2024-03-10',
        type: 'email',
        contact: 'Building Owner',
        subject: 'Modernization Opportunity Assessment',
        outcome: 'pending'
      },
      {
        id: '3',
        date: '2024-02-28',
        type: 'meeting',
        contact: 'Elevator Consultant',
        duration: '1 hour',
        notes: 'Site inspection and technical review',
        outcome: 'positive'
      }
    ]);
  }, [buildingId, initialContacts]);

  const handleAddContact = () => {
    if (newContact.name && newContact.role) {
      const contact: Contact = {
        id: Date.now().toString(),
        name: newContact.name,
        role: newContact.role,
        company: newContact.company,
        phone: newContact.phone,
        email: newContact.email
      };
      setContacts([...contacts, contact]);
      setNewContact({ name: '', role: '', company: '', phone: '', email: '' });
      setShowAddContact(false);
    }
  };

  const handleUpdateContact = () => {
    if (editingContact) {
      setContacts(contacts.map(c => c.id === editingContact.id ? editingContact : c));
      setEditingContact(null);
    }
  };

  const handleDeleteContact = (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  const getContactIcon = (role: string) => {
    if (role.toLowerCase().includes('owner')) return <Building2 className="h-4 w-4" />;
    if (role.toLowerCase().includes('manager')) return <Briefcase className="h-4 w-4" />;
    if (role.toLowerCase().includes('maintenance')) return <User className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4 text-blue-600" />;
      case 'email': return <Mail className="h-4 w-4 text-green-600" />;
      case 'meeting': return <Users className="h-4 w-4 text-purple-600" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 bg-[#004b87] text-white flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Contact Management
        </h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">All Contacts ({contacts.length})</h3>
            <button
              onClick={() => setShowAddContact(true)}
              className="px-3 py-1 bg-[#ff6319] text-white rounded-md hover:bg-[#e5541a] transition-colors flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add Contact</span>
            </button>
          </div>

          {/* Add Contact Form */}
          {showAddContact && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-3">Add New Contact</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Name *"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                />
                <input
                  type="text"
                  placeholder="Role *"
                  value={newContact.role}
                  onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddContact}
                    className="px-4 py-2 bg-[#004b87] text-white rounded-md hover:bg-[#003a6c] transition-colors"
                  >
                    Save Contact
                  </button>
                  <button
                    onClick={() => {
                      setShowAddContact(false);
                      setNewContact({ name: '', role: '', company: '', phone: '', email: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contacts */}
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div key={contact.id} className="bg-white rounded-lg shadow-sm p-4">
                {editingContact?.id === contact.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingContact.name}
                      onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                    />
                    <input
                      type="text"
                      value={editingContact.role}
                      onChange={(e) => setEditingContact({ ...editingContact, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                    />
                    <input
                      type="tel"
                      value={editingContact.phone}
                      onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                    />
                    <input
                      type="email"
                      value={editingContact.email}
                      onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdateContact}
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingContact(null)}
                        className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          {getContactIcon(contact.role)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                            {contact.isPrimary && (
                              <span className="px-2 py-0.5 bg-[#ff6319] text-white text-xs rounded-full">Primary</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{contact.role}</p>
                          {contact.company && (
                            <p className="text-sm text-gray-500">{contact.company}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => setEditingContact(contact)}
                          className="p-1 text-gray-400 hover:text-[#004b87] transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {!contact.isPrimary && (
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      {contact.phone && (
                        <a href={`tel:${contact.phone}`} className="flex items-center space-x-2 text-sm text-[#004b87] hover:underline">
                          <Phone className="h-3 w-3" />
                          <span>{contact.phone}</span>
                        </a>
                      )}
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="flex items-center space-x-2 text-sm text-[#004b87] hover:underline">
                          <Mail className="h-3 w-3" />
                          <span>{contact.email}</span>
                        </a>
                      )}
                      {contact.lastContact && (
                        <p className="flex items-center space-x-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>Last contact: {contact.lastContact}</span>
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <button className="px-3 py-1 bg-[#004b87] text-white text-sm rounded-md hover:bg-[#003a6c] transition-colors flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>Call</span>
                      </button>
                      <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>Email</span>
                      </button>
                      <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>Note</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Communication Log */}
          <div className="mt-8">
            <h3 className="font-semibold text-gray-900 mb-4">Communication History</h3>
            <div className="space-y-3">
              {communicationLog.map((log) => (
                <div key={log.id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getActivityIcon(log.type)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {log.type === 'call' ? 'Phone Call' :
                             log.type === 'email' ? 'Email' :
                             log.type === 'meeting' ? 'Meeting' : 'Note'}
                          </span>
                          <span className="text-sm text-gray-500">with {log.contact}</span>
                        </div>
                        {log.subject && (
                          <p className="text-sm text-gray-700 mt-1">Subject: {log.subject}</p>
                        )}
                        {log.notes && (
                          <p className="text-sm text-gray-600 mt-1">{log.notes}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{log.date}</span>
                          </span>
                          {log.duration && (
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{log.duration}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      {log.outcome === 'positive' && (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          <Check className="h-3 w-3 mr-1" />
                          Positive
                        </span>
                      )}
                      {log.outcome === 'pending' && (
                        <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Actions */}
          <div className="mt-8 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Next Actions</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Schedule follow-up call with building owner</span>
              </li>
              <li className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Send modernization proposal draft</span>
              </li>
              <li className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Coordinate site inspection with maintenance team</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsSection;